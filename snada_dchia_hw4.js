var getJson = function(url){

    var promise = new Promise(function(resolve, reject){
        var request = new XMLHttpRequest();


        request.addEventListener("load", function(){
            if(request.status < 400 && request.status >= 200){
                //success
                resolve(request.response);
            }else{
                reject("ERROR: STATUS " + request.status + " WITH RESPONSE: " + request.response);
            }
        });

        request.addEventListener("error", function(event){
            reject(Error("network error"));
        });

        request.responseType = 'json';
        request.open("GET", url, true);
        request.send();
    });

    return promise;
};

var displayData = function(data){
    var list = document.getElementById('movie-list');
    var template = "<div class='shortView'> <img src=http://image.tmdb.org/t/p/w92/#poster_path#></img> <p class='title header'> #title# (#release_date#)</p> <p class='rating header'> Average Vote: #vote_average#</p></div>";
    template +=     "<div class='detailView hidden'>";
    template +=            "<img src='http://image.tmdb.org/t/p/w342/#poster_path#'> </img>"
    template +=            "<div class = 'details'>"
    template +=                 "<h1 class='title'> #original_title# (#release_date#)</h1> "
    template +=                 "<ul>"
    template +=                     "<li> Release Date: #full_release_date#</li>"
    template +=                     "<li> Vote Average: #vote_average#</li>"
    template +=                     "<li> Number of Votes: #vote_count#</li>"
    template +=                     "<li> Summary: #overview#</li>"
    template +=                 "</ul>"
    template +=            "</div>"
    template +=     "</div>"
    Object.keys(data).forEach(function(key){
        var item = document.createElement("li");

        var content = template.replace(/#[^#]*#/g, function(substring) {
            var property = substring.slice(1, -1);
            if (property === "release_date") {
                return data[key][property].slice(0,4);
            } else if(property === "full_release_date"){
                return data[key]["release_date"];
            }
            else { 
                return data[key][property];
            }
        });
        item.innerHTML = content;
        list.appendChild(item);

        item.addEventListener("click", function() {
            
            // Contract view if selected twice
            if (item.getElementsByClassName("detailView")[0].className === "detailView selected") {
                item.getElementsByClassName("detailView")[0].className = "detailView hidden";
                item.getElementsByClassName("shortView")[0].className = "shortView";
            }
            
            else {
                // var selectedDetail = list.getElementsByClassName("selected detailView");

                // for (var i = 0; i < selectedDetail.length; i++){
                //     selectedDetail[i].className = "detailView hidden";
                // }

                // var hiddenShorts = list.getElementsByClassName("hidden shortView");
                // for (var i = 0; i < hiddenShorts.length; i++){
                //     hiddenShorts[i].className = 'shortView';
                // }

                item.getElementsByClassName("detailView")[0].className = "detailView selected" ;
                item.getElementsByClassName("shortView")[0].className = "shortView hidden ";
            }
        });
    });
};

getJson('http://localhost:8000/movies.json')
.then(function(response){
    var selectList = document.getElementById("select");
    var orderList = document.getElementById("select-order");

    var updateList =  function(){
        sortByProperty(response["movies"], selectList.value, orderList.value);  
        document.getElementById("movie-list").innerHTML = "";
        displayData(response["movies"]);
    };
    selectList.onchange = updateList;
    orderList.onchange = updateList;

    updateList();   
})
.catch(function(event){
    console.log(event);
});

var sortByProperty = function(list, property, order) {
    // 1 for ascending means true
    // -1 means false
    var ascending;
    if(order == "ascending"){
        ascending = 1;
    }else{
        ascending = -1;
    }

    list.sort(function(a,b){
        if (a[property] > b[property])
            return 1 * ascending;
        if(a[property] === b[property])
            return 0;

        return -1 * ascending;
    });
};