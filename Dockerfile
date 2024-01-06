# notes:
# installing python3-launchpadlib resolves "AttributeError: 'NoneType' object has no attribute 'people'" when trying to install ethereum respository later
# see here for why --break-system-packages is needed: https://stackoverflow.com/questions/75608323/how-do-i-solve-error-externally-managed-environment-every-time-i-use-pip-3
FROM node:21
WORKDIR /usr/blockchain
RUN apt upgrade && apt update && apt install -y software-properties-common python3 python3-pip python3-launchpadlib nano
RUN npm install --save ethers
RUN pip3 install web3 py-solc-x python-dotenv --break-system-packages
RUN add-apt-repository ppa:ethereum/ethereum -y && apt update
COPY .env .
COPY trans.sol .
COPY compile_sepo.py .
COPY deploy_sepo.py .
CMD ["python3","deploy_sepo.py","--host","0.0.0.0"]