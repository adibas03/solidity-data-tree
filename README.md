# solidity-data-tree  
An implementation of data-store ( https://github.com/adibas03/solidity-data-store ) utilizing layers

`A basic database or data store using the solidity language for dynamic length and un-ordered data.`

This reduces the cost attached to the process of storage, and retrieval of data, presently on the ethereum block chain.
`* This implements layers (tree structure) and as such is more expensive than the linear structure`

#### insert  
`Tree.insertNode(indexid, nodeid, data)`

#### insert batch (max: 5 nodes)
`Tree.insertNodeBatch(indexid, [[nodeid, data],])`


#### remove
`Tree.removeNode(indexid, nodeid)`

#### fetch node data
`Store.getNode(nodeid)`

#### fetch a batch (5 nodes) from index data
`Store.getNodesBatch(indexid, last_nodeid)`
