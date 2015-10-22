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

/*
Sets up and returns the array of movies which we display on the DOM 
@param selectedMovies - hashTable that tells us whether a movie is currently expanded on the screen
@param data - JSON object containing movie info in its original format
*/
var setUp = function( data, isSelected){
    var moviesArray = [];
    var template = "<div class='viewContainer'>";
    template +=         "<div class='shortView'> <img src=http://image.tmdb.org/t/p/w92/#poster_path#></img> <p class='title header'> #title# (#release_date#)</p> <p class='rating header'> Average Vote: #vote_average#</p></div>";
    template +=            "<div class='detailView hidden'>";
    template +=                 "<img src='http://image.tmdb.org/t/p/w342/#poster_path#'> </img>";
    template +=                 "<div class = 'details'>";
    template +=                 "<h1 class='title'> #original_title# (#release_date#)</h1> ";
    template +=                 "<ul>";
    template +=                     "<li> Release Date: #full_release_date#</li>";
    template +=                     "<li> Vote Average: #vote_average#</li>";
    template +=                     "<li> Number of Votes: #vote_count#</li>";
    template +=                     "<li> Summary: #overview#</li>";
    template +=                 "</ul>";
    template +=                 "</div>";
    template +=         "</div>";
    template +=     "</div>";

    Object.keys(data).forEach(function(key){
        var domElementWrapper = [];
        var item = document.createElement("li");

        var content = template.replace(/#[^#]*#/g, function(substring) {
            var property = substring.slice(1, -1);
            var answer;
            if (property === "release_date") {
                answer = data[key][property].slice(0,4);
            } else if(property === "full_release_date"){
                answer = data[key]["release_date"];
            }
            else { //original_title
                answer =  data[key][property];
            }

            //asign the properties to the javascript item so that it can be easily sorted
            if (property === "title" || property === "release_date" ||  property === "vote_average") {
                if (property === "release_date") {
                    domElementWrapper[property] = data[key][property].slice(0,4);
                } else {
                    domElementWrapper[property] = data[key][property];
                }
            }

            return answer;
        });
        item.innerHTML = content;
        // list.appendChild(item);

        item.addEventListener("click", function() {
            
            //Contract detail view and display short view
            if (item.getElementsByClassName("detailView")[0].className === "detailView selected") {
                item.getElementsByClassName("detailView")[0].className = "detailView hidden";
                item.getElementsByClassName("shortView")[0].className = "shortView";
                isSelected[domElementWrapper.title + domElementWrapper.release_date] = undefined;
            }
            // Expand detail view if contracted
            else {
                item.getElementsByClassName("detailView")[0].className = "detailView selected" ;
                item.getElementsByClassName("shortView")[0].className = "shortView hidden ";
                isSelected[domElementWrapper.title + domElementWrapper.release_date] = 1;   
            }
        });

        domElementWrapper.item = item;
        moviesArray.push(domElementWrapper);
    });

    return moviesArray;
};

//Display the elements of moviesArray on the page
function displayData(moviesArray, isSelected) {
    var movie_list_dom = document.getElementById("movie-list"); 
    movie_list_dom.innerHTML = "";   //erase whatever is currently displayed 

    //display the new list
    moviesArray.forEach(function(movieInfo) {

        if (isSelected[movieInfo.title + movieInfo.release_date]) {
            movieInfo.item.getElementsByClassName("detailView")[0].className = "detailView selected" ;
            movieInfo.item.getElementsByClassName("shortView")[0].className = "shortView hidden ";
        }
        movie_list_dom.appendChild(movieInfo.item);
    });
}

getJson('http://localhost:8000/movies.json')
.then(function(response){
    var selectList = document.getElementById("select");
    var orderList = document.getElementById("select-order");
    var selectedMovies = [];    //keeps track of what movies are opened
    var moviesArray = setUp(response["movies"], selectedMovies); //keeps track of all the movies objects so that we do not need to destroy them 
    
    var updateList =  function(){
        sortByProperty(moviesArray, selectList.value, orderList.value);  
        displayData(moviesArray, selectedMovies);
    };

    displayData(moviesArray, selectedMovies);
    selectList.onchange = updateList;
    orderList.onchange = updateList;
})
.catch(function(event){
    console.log(event);
});


var sortByProperty = function(moviesArray, property, order) {

    // // 1 for ascending means true
    // // -1 means false
    var ascending;
    if (order == "ascending"){
        ascending = 1;
    }else{
        ascending = -1;
    }

    moviesArray.sort(function(a,b){
        if (a[property] > b[property])
            return 1 * ascending;
        if(a[property] === b[property])
            return 0;

        return -1 * ascending;
    });
};