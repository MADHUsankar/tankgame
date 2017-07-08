// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
// create the express app
var app = express();
// static content
var battlefield=[]

function populate(size){
  var size=size
  for (let i=0; i< size; i++){
    battlefield.push("*")
  }
  return battlefield;
}
battlefield=populate(16);


app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
 res.render("index");
})

var server= app.listen(8000, function() {
 // console.log("listening on port 8000");
});


var io= require( 'socket.io'). listen(server);
    // generate random index for array
    var turn="";
    // switch turn
    function switch_turn(team){
      if(turn===""){
        turn=['green','red'][Math.floor(Math.random()*2)]
      }
      else if (team=='green'){
        turn='red'
      }
      else{
        turn='green'
      }
      return turn
    }

    function rand_idx(arr){
      let num=Math.floor(Math.random()*arr.length)
      console.log("random number:",num )
      return num
    }
    // Assign location function
    function assign_location(arr,idx,user){
      if (arr[idx]==="*"){
        user.location=idx
        arr[idx]=user
        return true
      }
      else{
        return false
      }
    }
    // check if battlefield is full
    function arr_full(arr){
      return arr.includes("*")
    }

    // check for number of players on a team and empty spaces
    function team_count(arr){
      var green=0,red=0,available=0,count={};
      for (let i=0; i <arr.length; i++){
        if (arr[i]==="*"){
          available ++
        }
        else if(arr[i].team=="green"){
          green++
        }
        else{
          red++
        }
      }
      count={green:green,red:red,available:available}
      return count
    }
    function hit(arr,data){
      // var initial_score= team_count(arr)
      var location=Number(data.location),enemy=data.enemy,enemy_player=data.enemy_player;
      var message;
      if (arr[location]==="*"){
        message= enemy+" Hit empty space"
      }
      else if(arr[location].team===enemy){
        message= enemy + " just killed their own team member, time a team building event."
      }
      else if(arr[location].name===enemy_player){
        message="Suicide is a sin!" + enemy_player + "."
      }
      else if (arr[location].name!=enemy_player){
        arr[location]="*"
        message= enemy + " Good hit!"
      }
      return message
    }

    function opponents_exist(arr,player_team){
      var count = team_count(arr)
        if (count.green===0 || count.red ===0){
          return false
        }
        return true
    }

    io.sockets.on( 'connection', function (socket){
    io.emit('count',team_count(battlefield))
    // got new user from client side
    socket.on("hit",function(data){
      var message= hit(battlefield,data)
      io.emit("hit_result",message)
      io.emit("battlefield",battlefield)
    })
    socket.on('new_player', function(user){
      console.log(user)
      if (!arr_full(battlefield)){
        console.log("Game is full, can't add new user")
      }
      else{
        // adding user to battlefield
        let idx =rand_idx(battlefield)
        while(!assign_location(battlefield,idx,user)){
          idx=rand_idx(battlefield)
        }
        // if an opponent exists emit battlefield
        if (!opponents_exist(battlefield,user.team)){
          socket.emit("wait_for_opponents")
        }
        else{
          io.emit("enough_players")
        }
        io.emit('battlefield',battlefield)
        io.emit('count',team_count(battlefield))
        console.log(battlefield)
    }
    })

});
