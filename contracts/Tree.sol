pragma solidity^0.4.11;

import "../libraries/TreeLib.sol";

contract Tree{

    mapping(bytes32=>TreeLib.Index) indexes;//Or a single index, based on how you want to arange your indexes

    uint max_depth=2; // Maxdepth of the tree; advised 5
    uint mtypes_count=3;//Count of mtypes,available structure types from the lib
    bytes8[3] mtypes = [ bytes8("Node"), bytes8("Section"), bytes8("Index")]; //Increase type to match structure types
    enum ltypes {Node,Section,Index} //Increase type to match structure types
    mapping(bytes32=>bytes32) public parent_child_lookup;

    uint parent_max_size = 10; //Max size for all parents equaling Max nodes = parent_max_size^(max_depth-1)

    function TreeContract(){
    }

    function indexExists(bytes32 index_id) constant returns (bool){
        return (indexes[index_id].id == index_id);
    }

    function childExists(bytes32 child_id) constant returns(bool){
        return (getParent(child_id) != 0x0);
    }

    function nodeExists(bytes32 index_id,bytes32 node_id) constant returns(bool){
        if(childExists(node_id)){
          return getHeirachy(node_id)[1] == index_id;
        }
        else return false;
    }

    function getParent(bytes32 child_id) constant returns(bytes32){
        return parent_child_lookup[child_id];
    }

    function getHeirachy(bytes32 child_id) constant returns (bytes32[2] memory search_up /*should match (max_depth)*/){
        bytes32 main_index_id;

        //Fetch the node's parent
        main_index_id = getParent(child_id);
        search_up[0] = main_index_id;

        uint i = 1;
        while((main_index_id = getParent(main_index_id)) != 0x0){
        search_up[i] = main_index_id;
        i++;
        }
    }

    function getSection(bytes32 section_id) internal constant returns(TreeLib.Section storage sector){
        bytes32[2] memory search_up; //size should match (max_depth)
        search_up = getHeirachy(section_id);

        //GenecricTree.SubSection storage subsector; //Only enabled if max_dept >2

        if(search_up.length>0){
            for(uint i=search_up.length-1;i>0;i--){
                if(i==search_up.length-1){
                    if(mtypes[i-1] == "Section"){
                        sector = indexes[search_up[i]].children[search_up[i-1]];
                    }
                }
            }
        }
    }

    function getNode(bytes32 node_id) constant returns (bytes32 id,bytes32 left,bytes32 right,bytes32 parent,bytes32 data){
        //set returns based on nature of base node

        return TreeLib.getNode(getSection(getParent(node_id)),node_id);
    }

    function getNodesBatch(bytes32 section_id,bytes32 last_node_id) constant returns (bytes32[5][5]) {

          return TreeLib.getNodesBatch(getSection(section_id),last_node_id);
    }

    function newIndex(bytes32 index_id)idNotEmpty(index_id){
        indexes[index_id] = TreeLib.newIndex(index_id,parent_max_size);
    }

    function insertSection(bytes32 section_id, bytes32 parent_id) idNotEmpty(section_id){
        require(!childExists(section_id)); //Ensure it does not exist

        //Create new index, if it does not exist
        if(!indexExists(parent_id)){
            newIndex(parent_id);
        }

        //Parent is an Index, store as child of index
        TreeLib.Index storage index = indexes[parent_id];
        parent_child_lookup[section_id] =  parent_id;
        TreeLib.insertSection(index,section_id);
    }

    function insertNode(bytes32 index_id, bytes32 section_id, bytes32 node_id, bytes32 data)idNotEmpty(node_id){
        //node_id required, atleast one of section_id or index_id required
        require(index_id != 0x0 && section_id != 0x0);

        //Function heirachy should be updated base on designed structures
        TreeLib.Index storage index = indexes[index_id];
        if(index.last == section_id){
            require(index.children[index.last].size<parent_max_size);
                //last sector can accomodate new node
                parent_child_lookup[node_id] =  index.last;
                TreeLib.insertNode(index.children[index.last],node_id,data);
        }
        else{
            if(!childExists(section_id)){
                insertSection(section_id, index_id);
            }
            TreeLib.Section storage sector =  getSection(section_id);
            require(sector.size<parent_max_size);
            parent_child_lookup[node_id] =  sector.id;
            TreeLib.insertNode(sector,node_id,data);
        }


    }

    modifier idNotEmpty(bytes32 id){
        require(id != 0x0);
        _;
    }


}
