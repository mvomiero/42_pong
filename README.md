# approach

1. DONE: dockerise 'main' and get it to run
2. integrate 'blockchain_database_test', so that blockchain hash appears correctly in django admin console
3. integrate into 'game_3d' when that is solid

# how to use

1. make an .env file in the root dir containing the variable BLOCKCHAIN_PRIVATE_KEY=<your private key>
2. run 'make' to build and run the docker container, it will submit a transaction and return the hash
3. we can check it by opening https://sepolia.etherscan.io/ and searching for the hash