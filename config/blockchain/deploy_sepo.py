import os
import json
from web3 import Web3
from pong.logger import logger

logger = logger()

async def deploy_sepo(result):
    with open('./pong/trans.abi', 'r') as abi_file:
        abi = json.load(abi_file)
    with open('./pong/trans.bin', 'r') as bin_file:
        bytecode = bin_file.read()
    provider_rpc = {
        "development": "http://localhost:9944",
        "sepolia": "https://rpc.notadegen.com/eth/sepolia",
    }
    web3 = Web3(Web3.HTTPProvider(provider_rpc["sepolia"]))

    account_from = {
        'private_key': os.getenv("BLOCKCHAIN_PRIVATE_KEY"),
        'address': '0xD20D8879EdC62684Ba82ebE37e97984Dd5Aae287',
    }
    address_to = '0x0C7f3ff8EFEB99053BEa51b041ec954BA26c4FD6'
    trans = web3.eth.contract(abi=abi, bytecode=bytecode)
    binary_result = result.encode('utf-8')
    count = web3.eth.get_transaction_count(account_from["address"])
    logger.info(f"The current count is {count}!")
    # latest_nonce = web3.eth.get_transaction_count(account_from["address"], 'pending')
    # if latest_nonce == count:
    #     count += 1
    # logger.info(f"The after check count is {count}!")
    current_gas_price = web3.eth.gas_price
    logger.warn(f'The current gas price is {current_gas_price}')
    new_gas_price = int(current_gas_price * 1.2)
    logger.warn(f'The new gas price is {new_gas_price}')
    construct_txn = trans.functions.save(binary_result).build_transaction(
        {
            "from": Web3.to_checksum_address(account_from["address"]),
            "gas": 10000000,
            "gasPrice": new_gas_price,
            # "gasPrice": web3.to_wei('55','gwei'),
            "to": Web3.to_checksum_address(address_to),
            "nonce": count,
        }
    )

    tx_create = web3.eth.account.sign_transaction(
        construct_txn, account_from["private_key"]
    )
    # try:
    #     tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)
    #     print(f"I am end of deploy. the hash is {tx_hash.hex()}")
    #     return tx_hash.hex()
    # except ValueError as e:
    #     print(f"Error:{e}")
    #     return "Error"

    tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)
    if tx_hash:
        logger.info(f'Transaction hash is complete: {tx_hash}')
        return tx_hash.hex()
    else:
        return "Pending"