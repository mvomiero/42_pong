# Instructions

1. run `make` to start the server
2. open chrome and go to `http://127.0.0.1:8000/blockchainTestApp/blockchainTest/graham/1/yy/4/` (or run `make test`)
- this will add a record of game data to the database and should return the id of the record as a http response
3. continue to add records by going to other URLs containing different data i.e. `http://127.0.0.1:8000/blockchainTestApp/blockchainTest/pierre/11/marco/5/`
4. to inspect the data, you can go to `http://127.0.0.1:8000/admin` (or run `make admin` and enter the username 'admin' and password 'backend', then under 'BLOCKCHAINTESTAPP' click on 'Game datas'
5. to remove all data from the database and start from scratch, first stop the server with CTRL+C, then run `make flush` and `make` to start the server again