var Tree = artifacts.require("./Tree.sol"),
web3,contrct,contrct_address,deploy_coinbase,deleted,
index_id = "Test-a",
node_object = function(n){n=n||new Array(5);return {id:n[0],left:n[1],right:n[2],parent:n[3],data:n[4]}},
nodes_container = function(){return [[],[],[],[],[]]},
nodes_object_container = function(){return [{},{},{},{},{}]},
index_object = function(a){a=a||new Array(6);return {mtype:Number(a[0]),size:Number(a[1]),maxsize:Number(a[2]),id:a[3],root:a[4],last:a[5]}},
tree_nodes = {
    'a': 18,
    'b': 0,
    'c': 7,
    'd': 11,
    'e': 16,
    'f': 3,
    'g': 16,
    'h': 17,
    'i': 17,
    'j': 18,
    'k': 12,
    'l': 3,
    'm': 4,
    'n': 6,
    'o': 11,
    'p': 5,
    'q': 12,
    'r': 1,
    's': 1,
    't': 16,
    'u': 14,
    'v': 3,
    'w': 7,
    'x': 13,
    'y': 6,
    'z': 17,
}

/*tree_nodes = {
    'ae':{
      'a': 18,
      'b': 0,
      'c': 7,
      'd': 11,
      'e': 16},
    'fj':{
      'f': 3,
      'g': 16,
      'h': 17,
      'i': 17,
      'j': 18},
    'ko':{
      'k': 12,
      'l': 3,
      'm': 4,
      'n': 6,
      'o': 11},
    'pt':{
      'p': 5,
      'q': 12,
      'r': 1,
      's': 1,
      't': 16},
    'uz':{
      'u': 14,
      'v': 3,
      'w': 7,
      'x': 13,
      'y': 6,
      'z': 17},
}*/

contract('Data-Tree', function(accounts) {
  deploy_coinbase = accounts[0];
  function padHex(a){return web3.utils.padRight(web3.utils.toHex(a),66)}


  it("should deploy Tree Contract", function() {
    var tree = Tree.deployed();
    return tree.then(function(instance) {
      contrct = instance;
      web3 = instance.constructor.web3;
      web3.utils = web3._extend.utils;
      contrct_address = instance.address;

      assert.notEqual(contrct.address, null, "Tree not deployed!!!");
      console.log("Tree deployed at "+contrct_address)
    });
  })

  it("Should create one new index",function(done){
      var sc="ae",tr="a";
      //nc = new nodes_container;
      //nc[0] = [tr,tree_nodes[sc][tr]];

        contrct.nodeExists.call(index_id,tr)
        .then(function(e1){
          assert.equal(e1,false,"Node e1 exists in Index before insertion");
        })
         .then(function(a){
          contrct.insertNode(index_id,tr,tree_nodes[tr])
          .then(function(a){
            console.log("Insertion Cost(single node):",a.receipt.gasUsed);
            contrct.nodeExists.call(index_id,tr)
            .then(function(e2){
              assert.equal(e2,true,"Node e2 does not exist in Index after insertion");
               crossCheck();
            })
          });
        })
        //Double check presence
        function crossCheck(){
          contrct.nodeExists.call(index_id,tr)
          .then(function(e3){
            assert.equal(e3,true,"Node e3 does not exist in Index after insertion");
            return sanityCheck();
          });
        }
        //Sanity check
        function sanityCheck(){
          s="cc";
        contrct.nodeExists.call(index_id,s)
        .then(function(e4){
          assert.equal(e4,false,"Node e4:"+s+" exists without insertion");
          done();
        });
      }
    });


  it("Should create batches of new indexes",function(done){
      var i = [],final,indexes = Object.keys(tree_nodes);

      indexes = indexes.splice(1);//Remove already added index;
      //delete(indexes[0]);

      for(ind=0;ind<indexes.length;ind+=5){
        //Check if first in batch already exists
        (function(indx){
        var sc,tr=indexes[indx];
        return sc = contrct.nodeExists.call(index_id,tr)
        .then(function(e1){
          assert.equal(e1,false,"Node e1 (first node in batch) exists in Index before insertion");
        })
        .then(function(){
          var to_add = new nodes_container();
          for(t_a=0;t_a<5;t_a++){
            to_add[t_a] = [indexes[indx+t_a],tree_nodes[indexes[indx+t_a]]];
          }
          console.log(to_add);

          i[tr] = contrct.insertNodeBatch(index_id,to_add)
          .then(function(a){
            console.log("Insertion cost:",a.receipt.gasUsed);
            contrct.nodeExists.call(index_id,tr,{gas:4000000})
            .then(function(e2){
              assert.equal(e2,true,"Node e2 does not exist in Index after insertion");
            })
            if(!(indx+5<indexes.length))crossCheck();
          });
        })
      })(ind);
      }

    function crossCheck(){
        // Make sure it still registers as having all of the nodes.
        for(ind=0;ind<indexes.length;ind+=5){
          (function(indx){
          var tr = indexes[indx];
          i[tr].then(function(){
            contrct.nodeExists.call(index_id,tr)
            .then(function(e3){
              assert.equal(e3,true,"Node e3 does not exist in Index after insertion");
              if(!(indx+5<indexes.length))sanityCheck();//Run sanity after last crosscheck
            });
          });
        })(ind);
        };
    }

    function sanityCheck(){
        // Sanity check
        ['aa', 'tsra', 'arst', 'bb', 'cc'].forEach(function(s){
          (function(n){
          contrct.nodeExists.call(index_id,s)
          .then(function(e4){
            assert.equal(e4,false,"Node e4 exists without insertion");
            if(n=='cc')done();
          });
        })(s);
          });
      }

        });

    it("Should remove a random Index",function(){

        var keys = Object.keys(tree_nodes),
        node_id = keys[Math.floor(keys.length*Math.random())];
        console.log("Chosen Node:",node_id);
        deleted == node_id;

        return contrct.nodeExists.call(index_id,node_id).
        then(function(r1){

          assert.equal(r1,true,"Node does not exist for removal");

          contrct.removeNode(index_id,node_id)
          .then(function(r2){
            console.log("Deletion cost:",r2.receipt.gasUsed);

            contrct.nodeExists.call(node_id)
            .then(function(r3){
              assert.equal(r3,false,"Node still exists after removal");
          })
        })
      });
    })


    it("Should fetch a random node from the Index",function(){

      var keys = Object.keys(tree_nodes),
      node_id = keys[Math.floor(keys.length*Math.random())];
      console.log("Chosen Node(Fetch):",node_id);
      return contrct.nodeExists.call(index_id,node_id)
      .then(function(e){
        if(node_id == deleted)
        assert.equal(false,e,"Deleted node should not exist");
        else
          assert.equal(true,e,"Inserted node does not exist");
      })
      .then(function(){
        contrct.getNode.call(node_id)
        .then(function(f){
          console.log(f,web3.fromAscii(node_id));
          //assert.equal(true,e,"Inserted node does not exist");
        })
      })

    });

    it("Should fetch all nodes on the Index",function(done){
      var nodes = [],index,last_node=0x0;
      contrct.getIndex.call(index_id)
      .then(function(idx){
        index = new index_object(idx);

        console.log("IDX:",index);

        function fetchNode(){
        contrct.getNodesBatch.call(index_id,last_node)
        .then(function(nodes_batch){
          console.log('fetching...');
          //console.log(nodes_batch)

            var all=new nodes_object_container,l=0,
            titles = Object.keys(new node_object),
            skips=[];
            nodes_batch.forEach(function(r){
              var rn=0;
              r.forEach(function(c){
                if(l==0 && c == padHex(0)){
                  skips.push(rn);
                }
                if(skips.indexOf(rn)>-1){
                  if(all[rn])
                  delete(all[rn]);
                  rn++;
                  return;
                }

                all[rn][titles[l]] = c;
                rn++;
              });
              l++;
            });

            all.forEach(function(e){
              nodes.push(e);
            })

            last_node=nodes[nodes.length-1].id;

          if((last_node==padHex(0) || nodes[nodes.length-1].right==padHex(0))  && (index.last == nodes[nodes.length-1].parent || nodes[nodes.length-1].parent==padHex(0x0))){
            console.log(nodes);
            done();
          }
          else fetchNode();
        });
        }
         fetchNode();
        })
      })

    });
