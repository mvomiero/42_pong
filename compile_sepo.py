# import os
import solcx

solcx.install_solc()
solcx.install_solc("0.8.23")
# solidity_directory = './blockchainTestApp'
# os.chdir(solidity_directory)
temp_file = solcx.compile_files(['trans.sol'], output_values=['abi', 'bin'],)

abi = temp_file['trans.sol:trans']['abi']
bytecode = temp_file['trans.sol:trans']['bin']