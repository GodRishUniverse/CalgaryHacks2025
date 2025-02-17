/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  WildlifeDAO,
  WildlifeDAOInterface,
} from "../../contracts/WildlifeDAO";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_wldToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wldMinted",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "daoFeeAmount",
        type: "uint256",
      },
    ],
    name: "DonationReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum WildlifeDAO.ProjectStatus",
        name: "oldStatus",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum WildlifeDAO.ProjectStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "ProjectStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "submitter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fundingRequired",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum WildlifeDAO.ProjectStatus",
        name: "status",
        type: "uint8",
      },
    ],
    name: "ProposalSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "support",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "votingPower",
        type: "uint256",
      },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    inputs: [],
    name: "DAO_FEE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_DONATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_DONATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_VOTE_POWER",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VOTE_COST",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VOTING_PERIOD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "voter",
        type: "address",
      },
    ],
    name: "checkVoteEligibility",
    outputs: [
      {
        internalType: "bool",
        name: "isEligible",
        type: "bool",
      },
      {
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "debugProjectStatus",
    outputs: [
      {
        internalType: "enum WildlifeDAO.ProjectStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "currentTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "votingStartTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "votingEndTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "canVoteNow",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_usdAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
    ],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "exchangeRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "getProjectState",
    outputs: [
      {
        internalType: "enum WildlifeDAO.ProjectStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "votingStartTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "votingEndTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "forVotes",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "againstVotes",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "projectCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "projects",
    outputs: [
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "address",
        name: "proposer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "fundingRequired",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fundingReceived",
        type: "uint256",
      },
      {
        internalType: "enum WildlifeDAO.ProjectStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "submissionTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "forVotes",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "againstVotes",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "votingStartTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "votingEndTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "executed",
        type: "bool",
      },
      {
        internalType: "string",
        name: "proposalId",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "proposalIdToProjectId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "proposalId",
        type: "string",
      },
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "fundingRequired",
        type: "uint256",
      },
    ],
    name: "submitProject",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalValueLocked",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalWLD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "support",
        type: "bool",
      },
    ],
    name: "voteOnProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "wldToken",
    outputs: [
      {
        internalType: "contract WildlifeDAOToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60803461011757601f61184438819003918201601f19168301916001600160401b0383118484101761011c5780849260209460405283398101031261011757516001600160a01b03808216918290036101175733156100fe576000549060018060a01b0319913383821617600055604051913391167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a3600160045582156100bc5750600154161760015560405161171190816101338239f35b62461bcd60e51b815260206004820152601560248201527f496e76616c696420746f6b656e206164647265737300000000000000000000006044820152606490fd5b604051631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fdfe608080604052600436101561001357600080fd5b600090813560e01c9081630b5367ad1461124057508063107046bd1461113a5780631e484e70146111165780632763b72a14610c3157806336fbad2614610c135780633ba0b9a914610bf55780634339e612146107645780634857317e14610747578063715018a6146106ed5780638004f9fa1461043f5780638da5cb5b146104185780639be3783d146103ef578063b1610d7e146103d1578063b7b5bfc114610373578063c75a79891461032b578063cbe905891461028a578063db45810e1461026e578063e01557141461020a578063e9e6a349146101ed578063ec18154e146101cf578063f2fde38b146101385763fe71b8ba1461011357600080fd5b346101355780600319360112610135576020604051678ac7230489e800008152f35b80fd5b5034610135576020366003190112610135576004356001600160a01b03818116918290036101ca5761016861147c565b81156101b157600054826bffffffffffffffffffffffff60a01b821617600055167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a380f35b604051631e4fbdf760e01b815260048101849052602490fd5b600080fd5b50346101355780600319360112610135576020600254604051908152f35b503461013557806003193601126101355760206040516101f48152f35b503461013557602036600319011261013557604060a091600435815260056020522060ff60058201541690600b81015490600c810154600a60098301549201549261025860405180966113ec565b6020850152604084015260608301526080820152f35b5034610135578060031936011261013557602060405160018152f35b503461013557602036600319011261013557600435815260056020526040812060ff60058201541690600c600b82015491015460038310156103175760a093508215918261030b575b826102ff575b6102e660405180956113ec565b4260208501526040840152606083015215156080820152f35b915080421115916102d9565b809250421015916102d3565b634e487b7160e01b84526021600452602484fd5b503461013557604036600319011261013557610350610348611466565b6004356114cb565b9061036f604051928392151583526040602084015260408301906113c7565b0390f35b5034610135576020366003190112610135576004359067ffffffffffffffff82116101355760206103be816103ab366004870161140f565b81604051938285809451938492016113a4565b8101600781520301902054604051908152f35b5034610135578060031936011261013557602060405162093a808152f35b50346101355780600319360112610135576001546040516001600160a01b039091168152602090f35b5034610135578060031936011261013557546040516001600160a01b039091168152602090f35b50604036600319011261013557600435610457611466565b600182106106b3576103e88211610679576001600160a01b038181161561064057670de0b6b3a76400009081840291848304148415171561062c57681b1ae4d6e2ef50000084028281046101f41483151715610618576127109004928383038381116106045786906104cb876002546114a8565b6002556104da856003546114a8565b600355836001541690813b15610600576040516320e224bb60e21b8082526001600160a01b03959095166004820152602481019190915291908290604490829084905af180156105f5576105e0575b509085918461056f575b505050604051928352602083015260408201527f3168ca6b1e292883c0668008556fb887f7cce92bcd3c1c57c15a34dcdccd589260603392a280f35b81600154169183541690823b156105d1576040519081526001600160a01b03919091166004820152602481018590529082908290604490829084905af180156105d5576105bd575b80610533565b6105c690611296565b6105d15783386105b7565b8380fd5b6040513d84823e3d90fd5b6105ed9096919296611296565b949038610529565b6040513d89823e3d90fd5b8280fd5b634e487b7160e01b87526011600452602487fd5b634e487b7160e01b86526011600452602486fd5b634e487b7160e01b85526011600452602485fd5b60405162461bcd60e51b8152602060048201526011602482015270125b9d985b1a59081c9958da5c1a595b9d607a1b6044820152606490fd5b60405162461bcd60e51b8152602060048201526012602482015271446f6e6174696f6e20746f6f206c6172676560701b6044820152606490fd5b60405162461bcd60e51b8152602060048201526012602482015271111bdb985d1a5bdb881d1bdbc81cdb585b1b60721b6044820152606490fd5b503461013557806003193601126101355761070661147c565b80546001600160a01b03198116825581906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b503461013557806003193601126101355760206040516103e88152f35b5034610135576040366003190112610135576004356024803590811515808303610bf157838552602092600584526040862085151580610be5575b15610bac5760ff6005820154166003811015610b9957610b5557600c8101544211610b1b57600881019133885282865260ff604089205416610ae7576001546040516370a0823160e01b8152336004820152906001600160a01b031687828881845afa918215610a6d578a92610ab8575b5068056bc75e2d631000008210610a78579087600492604051938480926318160ddd60e01b82525afa918215610a6d578a92610a3a575b5061271090818102918183041490151715610a27578115610a14570492604051906060820182811067ffffffffffffffff821117610a0157886108d993926108bd60408e600295825260018752848701938b8552828801958d8752338352522094511515859060ff801983541691151516179055565b51600184015551151591019060ff801983541691151516179055565b156109ec576009016108ec8282546114a8565b90555b60405191825283820152837fcbdf6214089cba887ecbf35a0b6a734589959c9763342c756bb2a80ca2bc9f6e60403393a3828452600582526040842090600c820154421161093b578480f35b6009820154600a83015490610bb861095383836114a8565b1015610960575b50508480f35b11156109e25760056002925b01937ff75c354d0772e6386c514de8e03be6b7fb27fe941335caa779ee1b9f34fe0c1e60408654956109af8251916109a78360ff8b166113ec565b8201876113ec565ba260038210156109d0575060ff169060ff191617905538808080808061095a565b634e487b7160e01b8552602160045284fd5b600560019261096c565b600a016109fa8282546114a8565b90556108ef565b634e487b7160e01b8b526041600452878bfd5b634e487b7160e01b8a526012600452868afd5b634e487b7160e01b8a526011600452868afd5b9091508781813d8311610a66575b610a5281836112dc565b81010312610a6257519038610847565b8980fd5b503d610a48565b6040513d8c823e3d90fd5b60405162461bcd60e51b8152600481018990526019818901527824b739bab33334b1b4b2b73a103b37ba34b733903837bbb2b960391b6044820152606490fd5b9091508781813d8311610ae0575b610ad081836112dc565b81010312610a6257519038610810565b503d610ac6565b60405162461bcd60e51b815260048101879052600d818701526c105b1c9958591e481d9bdd1959609a1b6044820152606490fd5b60405162461bcd60e51b81526004810186905260138186015272159bdd1a5b99c81c195c9a5bd908195b991959606a1b6044820152606490fd5b60405162461bcd60e51b815260048101869052601b818601527f50726f6a656374206e6f7420696e20766f74696e6720706861736500000000006044820152606490fd5b634e487b7160e01b885260216004528488fd5b60405162461bcd60e51b81526004810186905260128186015271125b9d985b1a59081c1c9bda9958dd08125160721b6044820152606490fd5b5060065486111561079f565b8480fd5b50346101355780600319360112610135576020600454604051908152f35b50346101355780600319360112610135576020600654604051908152f35b50346101355760803660031901126101355760043567ffffffffffffffff811161111257610c6390369060040161140f565b9060243567ffffffffffffffff811161111257610c8490369060040161140f565b60443567ffffffffffffffff811161060057610ca490369060040161140f565b926006549260001984146110fe576001840160065560018401815260056020526040812094825167ffffffffffffffff8111610f8357610ce7600e88015461125c565b601f81116110ba575b50806020601f8211600114611052578491611047575b508160011b916000199060031b1c191617600e8701555b835167ffffffffffffffff8111610f8357610d38875461125c565b601f8111611006575b50806020601f8211600114610fa2578491610f97575b508160011b916000199060031b1c19161786555b80519067ffffffffffffffff8211610f83578190610d8c600189015461125c565b601f8111610f33575b50602090601f8311600114610ec9578492610ebe575b50508160011b916000199060031b1c19161760018601555b60028501336bffffffffffffffffffffffff60a01b825416179055606435918260038701556005860160ff199081815416905542600688015542600b88015562093a804201804211610eaa5787600d91600c60209a015584600982015584600a8201550190815416905585610e4160405192838151938492016113a4565b81019060078252868160018801930301902055610e69604051936060855260608501906113c7565b918584015260408301527f50094398b94bd032f2883f60fcf80bc2d2f633c5bcaf147bb1bc23cb6d48ee7033928060018601930390a3600160405191018152f35b634e487b7160e01b84526011600452602484fd5b015190503880610dab565b600189018552602085209250601f198416855b818110610f1b5750908460019594939210610f02575b505050811b016001860155610dc3565b015160001960f88460031b161c19169055388080610ef2565b92936020600181928786015181550195019301610edc565b90915060018801845260208420601f840160051c810160208510610f7c575b90849392915b601f830160051c82018110610f6e575050610d95565b868155859450600101610f58565b5080610f52565b634e487b7160e01b83526041600452602483fd5b905085015138610d57565b91508784526020842084925b601f1983168410610fee576001935082601f19811610610fd5575b5050811b018655610d6b565b87015160001960f88460031b161c191690553880610fc9565b87810151825560209384019360019092019101610fae565b87845260208420601f830160051c810160208410611040575b601f830160051c82018110611035575050610d41565b85815560010161101f565b508061101f565b905084015138610d06565b600e89018552602085209150601f198316855b8181106110a257509083600194939210611089575b5050811b01600e870155610d1d565b86015160001960f88460031b161c19169055388061107a565b9192602060018192868b015181550194019201611065565b600e8801845260208420601f830160051c8101602084106110f7575b601f830160051c820181106110ec575050610cf0565b8581556001016110d6565b50806110d6565b634e487b7160e01b81526011600452602490fd5b5080fd5b5034610135578060031936011261013557602060405168056bc75e2d631000008152f35b5034610135576020366003190112610135576004358152600560205260409020611163816112fe565b61116f600183016112fe565b91600160a01b600190036002820154166003820154916004810154600582015460ff1660068301546009840154600a85015491600b86015493600c87015495600d88015460ff1697600e016111c3906112fe565b996040519c8d9c8d6101a090818152016111dc916113c7565b8d810360208f01526111ed916113c7565b9960408d015260608c015260808b015260a08a0161120a916113ec565b60c089015260e0880152610100870152610120860152610140850152151561016084015282810361018084015261036f916113c7565b9050346111125781600319360112611112576020906003548152f35b90600182811c9216801561128c575b602083101461127657565b634e487b7160e01b600052602260045260246000fd5b91607f169161126b565b67ffffffffffffffff81116112aa57604052565b634e487b7160e01b600052604160045260246000fd5b6040810190811067ffffffffffffffff8211176112aa57604052565b90601f8019910116810190811067ffffffffffffffff8211176112aa57604052565b90604051918260008254926113128461125c565b908184526001948581169081600014611381575060011461133e575b505061133c925003836112dc565b565b9093915060005260209081600020936000915b81831061136957505061133c9350820101388061132e565b85548884018501529485019487945091830191611351565b91505061133c94506020925060ff191682840152151560051b820101388061132e565b60005b8381106113b75750506000910152565b81810151838201526020016113a7565b906020916113e0815180928185528580860191016113a4565b601f01601f1916010190565b9060038210156113f95752565b634e487b7160e01b600052602160045260246000fd5b81601f820112156101ca5780359067ffffffffffffffff82116112aa5760405192611444601f8401601f1916602001856112dc565b828452602083830101116101ca57816000926020809301838601378301015290565b602435906001600160a01b03821682036101ca57565b6000546001600160a01b0316330361149057565b60405163118cdaa760e01b8152336004820152602490fd5b919082018092116114b557565b634e487b7160e01b600052601160045260246000fd5b9190916000818152602091600583526040948583209180159081156116cf575b506116a05760ff60058301541660038110156103175790849161166557600c8301544211611634576001600160a01b0390811680855260089390930182528684205460ff1661160957600154169160248751809481936370a0823160e01b835260048301525afa80156115ff5782906115c9575b68056bc75e2d6310000091501061159557506743616e20766f746560c01b600193519161158b836112c0565b6008835282015290565b7824b739bab33334b1b4b2b73a103b37ba34b733903837bbb2b960391b909351916115bf836112c0565b6019835282015290565b508281813d83116115f8575b6115df81836112dc565b810103126111125768056bc75e2d63100000905161155f565b503d6115d5565b85513d84823e3d90fd5b5050506c105b1c9958591e481d9bdd1959609a1b9093519161162a836112c0565b600d835282015290565b50505072159bdd1a5b99c81c195c9a5bd908195b991959606a1b9093519161165b836112c0565b6013835282015290565b5050507f50726f6a656374206e6f7420696e20766f74696e67207068617365000000000090935191611696836112c0565b601b835282015290565b505071125b9d985b1a59081c1c9bda9958dd08125160721b909351916116c5836112c0565b6012835282015290565b905060065410386114eb56fea2646970667358221220654f7f746c956e720c570a4f180d651ea6a260fa97e5597940c17765653d4d2f64736f6c63430008140033";

type WildlifeDAOConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WildlifeDAOConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WildlifeDAO__factory extends ContractFactory {
  constructor(...args: WildlifeDAOConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _wldToken: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_wldToken, overrides || {});
  }
  override deploy(
    _wldToken: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_wldToken, overrides || {}) as Promise<
      WildlifeDAO & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): WildlifeDAO__factory {
    return super.connect(runner) as WildlifeDAO__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WildlifeDAOInterface {
    return new Interface(_abi) as WildlifeDAOInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): WildlifeDAO {
    return new Contract(address, _abi, runner) as unknown as WildlifeDAO;
  }
}
