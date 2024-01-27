import json
from web3 import Web3

def deploy_sepo(result):
    with open('./blockchainTestApp/trans.abi', 'r') as abi_file:
        abi = json.load(abi_file)
    
    with open('./blockchainTestApp/trans.bin', 'r') as bin_file:
        bytecode = bin_file.read()

    provider_rpc = {
        "development": "http://localhost:9944",
        "sepolia": "https://rpc.notadegen.com/eth/sepolia",
    }
    
    web3 = Web3(Web3.HTTPProvider(provider_rpc["sepolia"]))

    account_from = {
        'private_key': '4ae1cc01b339a6e3691f3df17392a1b49b25111ea4a828fc54edad7d29c111b2',
        'address': '0xD20D8879EdC62684Ba82ebE37e97984Dd5Aae287',
    }

    address_to = '0x0C7f3ff8EFEB99053BEa51b041ec954BA26c4FD6'

    trans = web3.eth.contract(abi=abi, bytecode=bytecode)

    binary_result = result.encode('utf-8')
    construct_txn = trans.functions.save(binary_result).build_transaction(
        {
            "from": Web3.to_checksum_address(account_from["address"]),
            "nonce": web3.eth.get_transaction_count(Web3.to_checksum_address(account_from["address"])),
            "gas": 10000000,
            "gasPrice": web3.to_wei('65','gwei'),
            "to": Web3.to_checksum_address(address_to),
        }
    )

    tx_create = web3.eth.account.sign_transaction(
        construct_txn, account_from["private_key"]
    )

    tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)
    print(f'Contact transaction hash {tx_hash.hex()}')
    return tx_hash