require("dotenv").config();
const { importKey } = require("@taquito/signer");
const { TezosToolkit, MichelsonMap } = require("@taquito/taquito");
const pollJSON = require("./poll.json");

const RPC_URL = process.env.REACT_APP_RPC_URL;
const SECRET_KEY = process.env.SECRET_KEY;

const Tezos = new TezosToolkit(RPC_URL);

const deploy = async () => {
  console.log("Setting Secret key....");
  await importKey(Tezos, SECRET_KEY);
  const administrator = await Tezos.signer.publicKeyHash();
  const initialStorage = {
    polls: MichelsonMap.fromLiteral({}),
    votes: MichelsonMap.fromLiteral({}),
    voters: MichelsonMap.fromLiteral({}),
    administrator,
  };
  console.log("Deploying Contract....");
  try {
    const originationOp = await Tezos.contract.originate({
      code: pollJSON,
      storage: initialStorage,
    });
    console.log(
      `Waiting for confirmation of origination for ${originationOp.contractAddress}...`
    );
    await originationOp.contract();
    console.log(`Origination completed.`);
  } catch (error) {
    console.log(`Error:\n\n${JSON.stringify(error, null, 2)}`);
  }
};

deploy();
