when setting up a new ubuntu machine:

Firstly

`apt update && apt update -y && reboot`

when it returns

```
apt install -y screen emacs-nox python3 python3-pip python3-wheel nodejs postgresql-12 libpq-dev gcc g++ libssl-dev pkg-config openssl software-properties-common libgmp-dev libsecp256k1-dev python3-dev python-is-python3
useradd -s /bin/bash tezos
mkdir /home/tezos
cp -a /etc/skel/.[a-zA-Z]* /home/tezos
chown -R tezos:tezos /home/tezos
su - tezos
mkdir -m 700 .ssh
cat > .ssh/authorized_keys
```
paste in your ssh keys

```
chmod 600 .ssh/authorized_keys
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

sudo add-apt-repository ppa:serokell/tezos && sudo apt-get update
sudo apt-get install tezos-client

wget https://gitlab.com/ligolang/ligo/-/jobs/3370208693/artifacts/raw/ligo && sudo mv ligo /usr/local/bin && sudo chmod 755 /usr/local/bin/ligo

python3 -m pip install pytezos
bash <(curl -s https://smartpy.io/cli/install.sh)


```
