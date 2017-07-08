$(document). ready(function (){

  var name;
  var team;
  var count=0;
  var size;
      var socket  = io. connect();

      //create battlefield
      $('#size_button').click(function(){
        size=$('#size').val()
        var row_size=Math.floor(Math.sqrt(size))
        var table_row="<tr>"
        // console.log(size)
        for(let i=1; i<=size; i++){
          //append rows when i % row_size==0 else append cells
          let test1=((i-1)%row_size===0)
          let test2=(i-1)!=0
          if(test1 && test2){
            table_row+="</tr>"
            // console.log("row",table_row)
            $('table').append(table_row)
            table_row="<tr>"
          }
          table_row+="<td id="+(i-1)+">*</td>"
          // console.log("column", table_row)
        }
          table_row+="</tr>"
          $('table').append(table_row)
          $('#make_field').hide()
          console.log("Boondocks", size)
          socket.emit('battlefiled_size',size)
          // send size to backend
      })



      //hit result
      socket.on('hit_result',function(data){
        // console.log(data)
        count++
        // console.log(count)
        $('#message').html(data)
      })
      // count listening
      socket.on('count',function(data){
        // console.log(data)
        $('#green_count').html("Green: "+data.green)
        $('#red_count').html("Red: "+data.red)
        $('#available_count').html("Available: "+data.available)
      })
      // getting new player
      $('#new_user').click(function(){
        name=$('#name').val()
        team=$('#team').val()
        user={
          name: name,
          team: team,
          location: false
        }
        $('#user').hide()
        socket.emit('new_player',user)
      })
      // listening for battlefiled updates
      socket.on('battlefield',function(data){
        var td;
        for (let i in data){
          // console.log('battlefield', data[i])
          td="td#"+i
          if (data[i].constructor==String||(data[i].team!=team)){
            $(td).html("*")
            $(td).attr("class","star")
          }
          else{
            // console.log(data[i].team)
            $(td).html(data[i].name)
            $(td).addClass(data[i].team)
          }
        }
      })
      $('td').click(function(){
        var hit_location=$(this).attr('id')
        // console.log(hit_location.constructor)
        socket.emit("hit",{location: hit_location, enemy: team, enemy_player: name})
      })
      socket.on('wait_for_opponents', function(){
        alert("Wait for players to play with")
      })
      socket.on('enough_players', function(){
        alert("enough players let's play")
      })

  })
