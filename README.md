This repo is an attempt to combine the Dockerfiles for the following two branches
https://github.com/mvomiero/42_pong/tree/dockerised_blockchain
https://github.com/mvomiero/42_pong/tree/dockerised_blockchain_database_test

Before beginning, you will need make an .env file in the root dir containing the variable BLOCKCHAIN_PRIVATE_KEY=<your_key>

Now we can test the code from each of the branches...

# Part 1: Django Database

1. Run `make` to run docker and start the server
2. Open chrome and go to `http://127.0.0.1:8000/blockchainTestApp/blockchainTest/graham/1/yy/4/` (or run `make test`)
- this will add a record of game data to the database and should return the id of the record as a http response
3. Continue to add records by going to other URLs containing different data i.e. `http://127.0.0.1:8000/blockchainTestApp/blockchainTest/pierre/11/marco/5/`
4. To inspect the data, you can go to `http://127.0.0.1:8000/admin` (or run `make admin` and enter the username 'admin' and password 'backend', then under 'BLOCKCHAINTESTAPP' click on 'Game datas'
5. To remove all data from the database and start from scratch, first stop the server with CTRL+C, then run `make flush` and `make` to start the server again

# Part 2: Blockchain

1. Run 'make exec' to be able to execute commands interactively inside the container
2. Execute the command `cd /usr/blockchain; python3 deploy_sepo.py --host 0.0.0.0`. This should submit a transaction and return the hash (takes around 13 seconds)
3. We can check it by opening https://sepolia.etherscan.io/ and searching for the hash