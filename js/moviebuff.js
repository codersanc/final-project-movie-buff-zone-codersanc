/*
 * @file moviebuff.js
 * 
 * Provides functionality to the MBZ Website
 *
 * @author Sanchit Kumar
 * @version 1.0
 * 
 */

/* Global variable that holds items being compared */
var compareItems = [];

/* JQuery Plugin - FakeLoader Spinner */
$("#fakeLoader").fakeLoader({    
    timeToHide:500, //Time in milliseconds for fakeLoader disappear
    zIndex:99999, // Default zIndex
    spinner:"spinner1", //Options: 'spinner1', 'spinner2', 'spinner3', 'spinner4', 'spinner5', 'spinner6', 'spinner7' 
    bgColor:"#4C83FF" //Hex, RGB or RGBA colors
});

/**
 * Function to add a title to compare
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare button that was clicked 
 * @param {[Object]} comparatorBar - JQuery object of the comparitor bar at the bottom of the screen
 */
function addToCompare(addToCompareButton, comparatorBar) {

  /* Changing the compare button to remove button */
  addToCompareButton.find("i").removeClass("plus").addClass("close");
  addToCompareButton.find(".visible").text("Remove");
  addToCompareButton.blur();

  /* Setting up JQuery UI animation options */
  var options = { to: "#comparator-bar", className: "ui-effects-transfer"};

  /* Finding the closest card element to the add to compare button & applying animation */
  addToCompareButton.closest(".card").effect("transfer", options, 500);

  /* Creating compare token in the compare bar */
  var token = createCompareToken(addToCompareButton, comparatorBar);

  /* Setting the title in cookie */
  setCompareCookie(addToCompareButton.attr("data"));

  /* Binding the 'x' icon on the token to remove it */
  token.find("i").click(function(){
    removeFromCompare(addToCompareButton, comparatorBar, token);
  });

  /* If 2 items have already been added for compare */
  if(comparatorBar.find("span").length == 2) {
    /* Enabling compare button on the comparitor bar */
    $("#comparator-bar button").removeClass("disabled");
    $(".compare").addClass("disabled"); /* Disable other buttons */
    $(".compare").css("cssText", "pointer-events:auto !important;")
    /* Iterating over list of items added to compare */
    $.each(compareItems, function(index, value){
      /* To keep selected movie buttons enabled */
      $("div.compare").each(function(){
        if($(this).attr("data")==value) { // Find all buttons with data stored as movie id and title
          $(this).removeClass("disabled"); // Remove disabled class
        }
      });
    });
  }
}

/**
 * This function checks the cookie for an exisitng title and adds it to the comparator bar
 * 
 * @return {[null]} Returns null if cookie functionality breaks or cookie not set
 */
function reloadCompareBar() {
  if(typeof Cookies === 'undefined') // Checking for cookies plugin
   return null;
  var titles = [];
  /* Fetching the Cookie */
  var cookieValue = Cookies.get("titles");
  if (typeof cookieValue != 'undefined' && !isFieldNullOrEmpty(cookieValue)) { // if cookie is set and valid
    titles = cookieValue.split(","); // Splitting by comma
  } else {
    return null;
  }
  if(titles.length==2) { // If both titles are present
    $("div.compare").addClass("disabled"); /* Disable other buttons */
    $(".compare").css("cssText", "pointer-events:auto !important;");
  }
  $.each(titles, function(index, value){ // Loop on each cast member 
    var tempElement = $("<div>").attr("data", value);
    var token = createCompareToken(tempElement, $("#comparator-bar"));
    /* Changing the compare button to remove button */
    var addToCompareButton = $("#results-holder").find("[data=\""+ value +"\"]");
    if(addToCompareButton.length!=0){ // CHecking if the compare button was found
      /* Setting the style for the compare button */
      addToCompareButton.find("i").removeClass("plus").addClass("close");
      addToCompareButton.find(".visible").text("Remove");
      addToCompareButton.removeClass("disabled");
      /* Binding the 'x' icon on the token to remove it */
      token.find("i").click(function(){
        removeFromCompare(addToCompareButton, $("#comparator-bar"), token);
        removeCompareCookie(value);
      });
    } else {
      token.find("i").click(function(){
        /* Disabling compare button on comparitor bar */
        $("#comparator-bar button").addClass("disabled");

        /* Removing item from compare Items array */
        var index = $.inArray(value, compareItems);
        if (index>=0) compareItems.splice(index, 1);

        /* Removing item from cookie */
        removeCompareCookie(value);

        /* Enabling all compare buttons as we are no longer at limit */
        $(".compare").removeClass("disabled");
        token.remove();

        /* If 2 items have already been added for compare */
        if($("#comparator-bar").find("span").length == 0) {
          $("#comparator-bar").fadeOut("500"); // Hide compare bar
        }
      });
    }    
  });
  if(titles.length!=0) // If min 1 title is present
  $("#comparator-bar").fadeIn(500); // Show compare bar
}

/**
 * This function sets the comparison title in the Cookie
 * 
 * @param {[String]} newTitle - The new title that has been added for comparison  
 */
function setCompareCookie(newTitle){
  if(typeof Cookies === 'undefined') // Checking for cookies plugin
  return null;
  var titles = [];
  /* Fetching the Cookie */
  var cookieValue = Cookies.get("titles");
  /* Checking if cookie was stored or null */ 
  if (typeof cookieValue != 'undefined' && cookieValue!="") {
    titles = cookieValue.split(","); // Splitting by comma
  }
  /* Adding the new title to the array */
  if($.inArray(newTitle, titles)==-1) // Checking if title doesnt already exist
  titles.push(newTitle); // Pushing new title 
  
  cookieValue = titles.join(","); // Joining array elements to form comma separated value
  /* Setting the cookie */
  Cookies.set('titles', cookieValue, {
    expires:2
  });
}

/**
 * This function removes the comparison title from the Cookie
 * 
 * @param {[String]} removeTitle - Title string to remove from the cookie 
 */
function removeCompareCookie(removeTitle) {
  if(typeof Cookies === 'undefined') // Checking for cookies plugin 
  return null;
  var titles = [];
  /* Fetching the Cookie */
  var cookieValue = Cookies.get("titles");
  if (typeof cookieValue != 'undefined' && !isFieldNullOrEmpty(cookieValue)) {
    titles = cookieValue.split(","); // Splitting by comma
  }
  /* Checking at which index the title is */
  var index = $.inArray(removeTitle, titles);
  /* Removing the title from the array */
  if (index>=0) titles.splice(index, 1);
  /* Setting the new array in the cookie */
  cookieValue = titles.join(","); // Joining array elements to form comma separated value
  Cookies.set('titles', cookieValue, {
    expires:2
  });
}

/**
 * Function to remove a title from comparison
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare/remove button of the title card 
 * @param {[Object]} comparatorBar - JQuery object of the comparitor bar at the bottom of the screen
 * @param {[Object]} token - JQuery object token of the title added into the comparitor bar
 */
function removeFromCompare (addToCompareButton, comparatorBar, token) {
  addToCompareButton.find("i").addClass("plus").removeClass("close");
  addToCompareButton.find(".visible").text("Compare");
  addToCompareButton.blur();

  /* Disabling compare button on comparitor bar */
  $("#comparator-bar button").addClass("disabled");

  /* Removing item from compare Items array */
  var index = $.inArray(addToCompareButton.attr("data"), compareItems);
  if (index>=0) compareItems.splice(index, 1);

  /* Removing item from cookie */
  removeCompareCookie(addToCompareButton.attr("data"));

  /* Enabling all compare buttons as we are no longer at limit */
  $(".compare").removeClass("disabled");
  token.remove();

  /* If 2 items have already been added for compare */
  if(comparatorBar.find("span").length == 0) {
    comparatorBar.fadeOut("500");
  }
}

/**
 * Function to create a compare token in the compare bar
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare button that was clicked 
 * @param {[Object]} comparatorBar - JQuery object of the comparitor bar at the bottom of the screen
 * @return {[Object]} token - The crated JQuery object of token that was added to the comparitor bar
 */
function createCompareToken (addToCompareButton, comparatorBar) {
  /* Created token span */
  var token = $("<span class='ui label transition visible'></span>");
  var tokenData = addToCompareButton.attr("data");
  /* Text Node to be inserted into the token span (Obtained from data attr of the add to compare button) */
  var tokenContent = tokenData.split("_")[1];
  compareItems.push(tokenData);

  /* Adding token content to the data attr */
  token.attr("data", tokenData.split("_")[0]);
  token.attr("data-tooltip", tokenContent);
  token.attr("data-inverted","");
  token.attr("data-position","top left");

  /* Created token delete icon */
  var tokenIcon = $("<i class='delete icon'></i>");

  /* Appending newly created token elements */
  token.append(returnTruncatedString(tokenContent, 20)).append(tokenIcon);
  comparatorBar.append(token);

  return token;
}

/**
 * This function truncates strings to a specified limit
 * 
 * @param  {[String]} string The String that needs to be truncated
 * @param  {[Int]} limit  The number of characters till which truncating is required
 * 
 * @return {[String]} The truncated string
 */
function returnTruncatedString(string, limit) {
  if (string.indexOf(" ")==-1 || string.length < 15) return string; // Return string as it is if there are no spaces or length is less than 15
  return jQuery.trim(string).substring(0, limit) // Trimming the string and 
    .split(" ").slice(0, -1).join(" ") + "...";
}

/**
 * This function takes the user to the details page of the movie
 * 
 * @param  {[String]} titleID The ID of the title for which details are requested
 */
function showDetails(titleID) {
  $("#fakeLoader").fadeIn();
  /* First get call to obtain movie details */
  axios.get('https://api.themoviedb.org/3/movie/' + titleID + '?api_key=03f36b1d285bb38db672a6c9beac463a&language=en-US&append_to_response=releases')
    .then(function (response) {
      if (response!=null) {
        /* Setting Response into local storage */
        localStorage.setItem('details', JSON.stringify(response));
        /* Second Get call to obtain cast */
        axios.get('https://api.themoviedb.org/3/movie/' + titleID + '/credits?api_key=03f36b1d285bb38db672a6c9beac463a&language=en-US')
        .then(function (response) {
          if (response!=null) {
            /* Setting Response into local storage */
            localStorage.setItem('cast', JSON.stringify(response));
            window.location.href="details.html";  // Redirecting to Details page
            }
        })
        .catch(function (error) {
          // console.log(error); Error
      });
        }
    })
    .catch(function (error) {
      // console.log(error); Error
  });
}

/**
 * This function takes the user to the comparison page
 */
function comparisonPage(){
  $("#fakeLoader").fadeIn();
  /* First Get call to obtain first title details */
  axios.get('https://api.themoviedb.org/3/movie/' + compareItems[0] + '?api_key=03f36b1d285bb38db672a6c9beac463a&language=en-US')
    .then(function (response) {
      if (response!=null) {
        /* Setting 1st title response in local storage */
        localStorage.setItem('title_1', JSON.stringify(response));
        /* Second Get call to obtain first title cast */
        axios.get('https://api.themoviedb.org/3/movie/' + compareItems[0] + '/credits?api_key=03f36b1d285bb38db672a6c9beac463a&language=en-US')
        .then(function (response) {
          if (response!=null) {
            /* Setting 1st title cast response in local storage */
            localStorage.setItem('cast_1', JSON.stringify(response));
            
            /* Third Get call to obtain second title details */
            axios.get('https://api.themoviedb.org/3/movie/' + compareItems[1] + '?api_key=03f36b1d285bb38db672a6c9beac463a&language=en-US')
            .then(function (response) {
              if (response!=null) {
                /* Setting Response into local storage */
                localStorage.setItem('title_2', JSON.stringify(response));
                /* Fourth Get call to obtain second title cast */
                axios.get('https://api.themoviedb.org/3/movie/' + compareItems[1] + '/credits?api_key=03f36b1d285bb38db672a6c9beac463a&language=en-US')
                .then(function (response) {
                  if (response!=null) {
                    /* Setting Response into local storage */
                    localStorage.setItem('cast_2', JSON.stringify(response));
                    window.location.href="compare.html";  // Redirecting to Compare page
                  }
                })
                .catch(function (error) {
                  // console.log(error); Error
                });
              }
            })
            .catch(function (error) {
              // console.log(error); Error
            });
          }
        })
        .catch(function (error) {
          // console.log(error); Error
        });
      }
    })
    .catch(function (error) {
      // console.log(error); Error
    });
}

/**
 * Adjusts the height of the ghost container backdrop
 */
function adjustTansparentBackdrop(){
  $("#ghost-container").height($("#main-container").outerHeight());
  $("#ghost-container").offset({top:$("#main-container").offset().top, left: 0});
}

/**
 * Adjust heights of elements to equate them
 * 
 * @param  {[Object]} firstElement  The first element that needs to be checked
 * @param  {[Object]} secondElement The second element that needs to be checked
 * 
 */
function adjustHeights(firstElement, secondElement){
  var firstElementHeight = firstElement.outerHeight(); // Getting the height of the first element
    var secondElementHeight = secondElement.outerHeight(); // Getting the height of the second elements
    if (firstElementHeight>secondElementHeight){ // Comparing heights and setting to the larger value
      secondElement.css("cssText", "height:" + firstElementHeight + "px !important"); 
    } else {
      firstElement.css("cssText", "height:" + secondElementHeight + "px !important"); 
    }
}

/**
 * This function handles the headers of the compare cards (Sticks on scrolling below them)
 * 
 */
function stickyHeaders() {
  var win = $(window); // Window object
  var sticky = $(".sticky"); // Elements that need to be made sticky
  var pos = sticky.offset().top; // Current top offset
  win.on('scroll', function(){
    if (win.scrollTop() >= pos) { // if scroll position is more than pos 
      sticky.addClass("fixedPos"); // Adding sticky css class  
      adjustHeights($(".first .mainCards > .header"), $(".second .mainCards > .header")); // Adjust heights
      $(".sticky").css("margin-left", "-14px"); // fixing position
      $(".sticky").css("width", $(".mainCards").outerWidth()); // adjusting width
    } else {
      sticky.removeClass("fixedPos"); // Removing sticky css class
      $(".sticky").css("margin-left", "0px"); // fixing position
      $(".sticky").css("width", "auto"); // adjusting width
      adjustHeights($(".first .mainCards > .header"), $(".second .mainCards > .header")); // Adjust heights
    }
  });
}

/**
 * Function that checks if form element's value is blank
 * 
 * @param  {[Object]}  element The element who's value needs to be checked
 * @return {Boolean}         [description]
 */
function isEmpty(element) {
  // Trimming the value of the field to get rid of unnecessary blank spaces 
  element.value = element.value.trim();
  // Checking for blank field
  if (element.value === "") { 
    return true; // is blank
  } else {
    return false; // is not blank
  }
}

/**
 * This function displays the error toast message
 * @param  {[Object]} inputField The input field for which the error has to be displayed
 */
function displayErrorToast(inputField){
  $(inputField).parent().addClass("error"); // Adding error class to field
  $(inputField).on('keypress', function(){
    $(inputField).parent().removeClass("error"); // removing error class on key press in the input field
  });
  if($(".error-message").is(":hidden")) { // Only if error is not already being displayed
    $(".error-message").slideDown().delay(2000).slideUp(); // SHow error toast
    $(".error").effect('shake', {distance:5}); // Shake blank error field
  }
}

/**
 * This function generates the results cards markup using the results JSON object
 * 
 * @param  {[Object]} resultsObj The JSON object returned from the search results 
 */
function createResultsMarkup(resultsObj){
  /* Looping on the results object */
  $(resultsObj).each(function(){
    if (isFieldNullOrEmpty(this.title)){return true;} // Break the loop if the title is blank
    /* Creating variables for the markup */
    var column = $("<div>", {class: "column"}); // Main column container
      var raisedCard = $("<div>", {class: "ui fluid raised card"}); // raised card container
        var imageContainer = $("<div>", {class: "image"}); // Image container
          if(!isFieldNullOrEmpty(this.poster_path)) { // If Path is valid
            var image = $("<img>", {src: "https://image.tmdb.org/t/p/w185_and_h278_bestv2" + this.poster_path}); // Setting poster image path
          } else { // If path comes as Null
            var image = $("<img>", {src: "images/fallback.png"}); // Using fallback image
          }
        var content = $("<div>", {class:"content"}); //content container
          var header = $("<div>", {class:"header", html: this.title}); //Setting title
          var date = $("<div>", {class:"meta", html: returnNAString(this.release_date)}); // Setting release date
          var description = $("<div>", {class:"description", html: returnNAString(this.overview)}); // Setting overview
        var extraContent = $("<div>", {class:"extra content"}); // EXtra content container 
          if(!isFieldNullOrEmpty(this.vote_average) && this.vote_average!=0){ // If rating is valid
            /*Initializing progress bar */
          var progressContainer = $("<div>", {class:"ui small indicating progress active"}).attr("data-percent", (this.vote_average*10)).attr("data-tooltip","User Rating").attr("data-inverted","");
            var progressBar = $("<div>", {class:"bar", style:"transition-duration:300ms;width:"+ (this.vote_average*10) + "%;"});
              var progress = $("<div>", {class:"progress"});
                var progressLabel = $("<div>", {class: "label", html: ""+(this.vote_average*10)+"%"});
          } else { // If not rated
            /* Setting progress bar to 0% Not rated */
            var progressContainer = $("<div>", {class:"ui small indicating progress active"}).attr("data-percent", 0).attr("data-tooltip","User Rating").attr("data-inverted","");
            var progressBar = $("<div>", {class:"bar", style:"transition-duration:300ms;width:"+ 0 + "%;"});
              var progress = $("<div>", {class:"progress"});
                var progressLabel = $("<div>", {class: "label", html: "Not Rated"});    
          }
        var extraContent2 = $("<div>", {class: "extra content"}); // EXtra content container
          var buttonContainer = $("<div>", {class: "ui two buttons"}); 
            var animatedButton1 = $("<div>", {class: "ui animated primary button gradientColor", tabindex:"0"}); // Details Button
              var visibleContent1 = $("<div>", {class: "visible content", html: "Details"}); 
              var hiddenContent1 = $("<div>", {class: "hidden content"});
                var icon1 = $("<i>", {class: "right arrow icon"});
            var animatedButton2 = $("<div>", {class: "ui animated button compare darkGradientColor", tabindex:"0"}).attr("data", this.id+"_"+this.title);
              var visibleContent2 = $("<div>", {class: "visible content", html:"Compare"});  // Compare Button
              var hiddenContent2 = $("<div>", {class: "hidden content"});
                var icon2 = $("<i>", {class: "plus icon"});

    /* Combining the markup */
    hiddenContent2.append(icon2);
    animatedButton2.append(visibleContent2).append(hiddenContent2);
    hiddenContent1.append(icon1);
    animatedButton1.append(visibleContent1).append(hiddenContent1);
    buttonContainer.append(animatedButton1).append(animatedButton2);
    extraContent2.append(buttonContainer);
    progressBar.append(progress);
    progressContainer.append(progressBar).append(progressLabel);
    extraContent.append(progressContainer);
    content.append(header).append(date).append(description);
    imageContainer.append(image);
    raisedCard.append(imageContainer).append(content).append(extraContent).append(extraContent2);
    column.append(raisedCard);

    /* Appending the markup into the results container */
    $("#results-holder").append(column);
  });
}

/**
 * This function generates the cast cards for the compare page
 * @param  {[Object]} cast The JSON object that holds the value of the cast
 * @return {[Card]} The card for the cast member
 */
function createCastMarkup(cast) {
  var card = $("<div>", {class: "card"});
    var imageContainer = $("<div>", {class: "image"});
      var image = $("<img>", {src: "https://image.tmdb.org/t/p/w780" + cast.profile_path}); // Cast image
    var content = $("<div>", {class: "content"});
      var celebrity = $("<div>", {class: "header", html: cast.name}); // Cast name
      var character = $("<div>", {class: "meta", html: cast.character}); // Cast character

  /* Appending markup to create the cast card */
  content.append(celebrity).append(character);
  imageContainer.append(image);
  card.append(imageContainer).append(content);
  return card;
}

/**
 * This function adds the cast cards to the target
 * @param {[Object]} object The cast object
 * @param {[Object]} target The target to which the cast markup aneeds to be appended
 */
function addCastMarkup(object, target) {
  var limit=4;
  target.html("");
  if(object.length==0){
    target.html("Not Available"); // If no cast info available
  }
  $.each(object, function(index, value){ // Loop on each cast member
    if (isFieldNullOrEmpty(value.profile_path)) {
      limit++;
      return true;
    }
    if (index==limit) return false; // Run for only top 4 cast members
    target.append(createCastMarkup(value)); // add the card markup to the target
    });
}

/**
 * This function creates the rating bar markup for the compare page
 * @param  {[Int]} value The rating value
 * @return {[Object]} Generated progress component markup
 */
function createRatingMarkup(value) {
  if(!isFieldNullOrEmpty(value) && value!=0){ // If rating is valid
    /*Initializing progress bar */
      var progressContainer = $("<div>", {class: "ui small indicating progress active"}).attr("data-percent", value*10).attr("data-tooltip","User Rating").attr("data-inverted","");
    var progressBar = $("<div>", {class:"bar", style:"transition-duration:300ms;width:" + (value*10) + "%;"});
      var progress = $("<div>", {class:"progress"});
    var progressLabel = $("<div>", {class: "label", html: (value*10) + "%"});
    } else { // If not rated
            /* Setting progress bar to 0% Not rated */
      var progressContainer = $("<div>", {class:"ui small indicating progress active"}).attr("data-percent", 0).attr("data-tooltip","User Rating").attr("data-inverted","");
      var progressBar = $("<div>", {class:"bar", style:"transition-duration:300ms;width:"+ 0 + "%;"});
        var progress = $("<div>", {class:"progress"});
      var progressLabel = $("<div>", {class: "label", html: "Not Rated"});    
    }

  progressBar.append(progress);
  progressContainer.append(progressBar).append(progressLabel);
  return progressContainer; 
}

/**
 * This function generates markup for the genres on the compare page
 * @param  {[Object]} object JSON object with the list of genres
 * @param  {[Object]} target Where the markup needs to be appeneded
 */
function createGenresMarkup(object, target) {
  target.html("");
  if(object.length==0){
    target.html("Not Available"); // If no cast info available
  }
  $.each(object, function(index, value){ // Loop on each cast member 
    var progressLabel = $("<p>", {class: "ui inverted segment inlineBlock", html: value.name}); 
    if (index==4) return false; // Run for only top 4 cast members
    target.append(progressLabel); // add the markup to the target
    });
  
}

/**
 * This function adds more details (director and screenplay) to the movie details page
 * @param  {[Object]} crew JSON object holding list of crew members
 */
function createMoreDetails(crew){
  var director = "";
  var screenplay = "";
  /* Iterating on the crew array */
  $.each(crew, function(index, value){
    if (value.job === "Director") { // For directors
      if(director=="") { // If first director
        director+= value.name; // Add director name
      } else {
        director+= (", " + value.name); // Add comma separated director name
      }
    }
    if (value.job === "Screenplay") { // FOr screenplay
      if(screenplay=="") {
        screenplay+= value.name; // Add screenplay writer name
      } else {
        screenplay+= (", " + value.name); // Add comma separated screenplay writer name
      }
    }
  });
  if(director!=""){
    $(".movie-director").html(director); // Push into DOM
  } else {
    $(".movie-director").html("Not Available");
  }
  if(screenplay!="") {
    $(".movie-screenplay").html(screenplay); // Push into DOM
  } else {
    $(".movie-screenplay").html("Not Available");
  }
}

/**
 * This function generates the css text for the masthead image
 * @param  {[String} path Holds the path to the masthead image
 * 
 * @return {[String]} the css text that was generated
 */
function generateMastheadCSS(path) {
  var cssText = "background-size: cover !important;";
  if(path!=null) {
    cssText += "background: linear-gradient(to bottom,rgba(0, 0, 0, 0.80), rgba(0, 0, 0, 0.50)), url('https://image.tmdb.org/t/p/w780" + path + "') no-repeat !important;";
  } else {
    cssText += "background: linear-gradient(to bottom,rgba(0, 0, 0, 0.80), rgba(0, 0, 0, 0.50));";
  }
  cssText += "-webkit-filter: blur(10px);";
  cssText += "-moz-filter: blur(10px)";
  cssText += "-o-filter: blur(10px)";
  cssText += "-ms-filter: blur(10px);";
  cssText += "filter: blur(10px);";
  cssText += "position:absolute;";
  cssText += "top:0;";
  cssText += "left:0;";
  cssText += "overflow: hidden;";
  cssText += "transform: scale(1.1);";
  cssText += "max-width: 100%;";
  cssText += "width: 100% !important;";
  cssText += "overflow: hidden !important;";
  return cssText;
}

/**
 * This function sets up the masthead
 * @param  {[String]} imagePath Path of the masthead image
 */
function setupMasthead(imagePath){
  $(".masthead-image").width($(".masthead").outerWidth());
  $(".masthead-image").css("cssText", generateMastheadCSS(imagePath)); // Adding CSS to the masthead image
  $(".masthead-image").css("background-size", "cover");
  $(".masthead-image").height($("#masthead-content").outerHeight());
  $(".masthead-image").css("overflow","hidden");
}

/**
 * Function converts time in minutes to proper format
 * @param  {[Int]} timeInMinutes The time in minutes
 * 
 * @return {[String]} Formatted time in hours and mins
 */
function formatDuration(timeInMinutes) {
  if(isFieldNullOrEmpty(timeInMinutes) || timeInMinutes == 0) return "Not Available"; // Return if time is zero or null
    var minutes = timeInMinutes % 60; // Minutes component
    var hours = Math.floor(timeInMinutes / 60); // Hours component
    if(hours==0) return minutes + "m"; // Formatted duration if hours = 0
    return hours + "h " + minutes + "m"; // Formatted duration
}

/**
 * Function to format currency
 * 
 * @param  {[Int]} currency The currency in raw numeric form
 * @return {[String]} The formatted currency
 */
function formatCurrency(currency) {
  if (isFieldNullOrEmpty(currency) || currency == 0) return "Not Available";
  return '$' + currency.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"); // Regular expression to format currency and replace by comma appropriately
}

/**
 * Function to format date
 * @param  {[String]} date The date in its raw format
 * @return {[String]} Formatted date
 */
function formatDate(date) {
  var splitDate = date.split("-"); // YYYY-MM-DD
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; // Months Array
  return months[parseInt(splitDate[1])-1] + " " + splitDate[2] + ", " + splitDate[0]; 
}

/**
 * This function processes the language code and inserts the language name into the field
 * @param {[String]} languageCode The raw language code
 */
function addLanguage(languageCode) {
  axios.get('data/languages.json')
    .then(function (response) {
      $(".movie-language").html(response.data[languageCode].name);
    })
    .catch(function (error) {
      $(".movie-language").html("Not Available");
  });  
}

/**
 * This function fetches the description for the certification rating
 * @param {[String]} certification The certification for which description needs to be fetched
 */
function addCertificationDescription(certification){
  var flag = false; //  flag to see if the certification was found in the json
  axios.get('data/certifications.json') // certification definitions json
    .then(function (response) {
      $.each(response.data.certifications, function(index, value){ // looping on certifications
        if(flag) return false;
        $.each(value, function(index, value){
          if(flag) return false;
          if(value.certification == certification){ // checking if certification received from API matches any in JSON
            $(".ratingIcon").attr('data-content', value.meaning);
            $(".ratingIcon").html(value.certification);
            flag = true;
            return false;
          }
        });
      });
      if(!flag) {
        $(".ratingIcon").attr('data-content', ''); // In case of error, setting tooltip as blank
        $(".ratingIcon").html('Not Available'); // In case of error, setting certification as Not available
      }
    })
    .catch(function (error) {
      // console.log(error);
      $(".ratingIcon").attr('data-content', ''); // In case of error, setting tooltip as blank
      $(".ratingIcon").html('Not Available'); // In case of error, setting certification as Not available
  });  
}

/**
 * This function adds the country name in the flag tooltip
 * @param {[String]} country The name of the country
 */
function addCountryTooltip(country){
    $(".flag").parent().attr('data-tooltip', country);
    $(".flag").parent().attr('data-inverted', '');
    $(".flag").parent().attr("data-position", "right center");  
}

/**
 * This function creates the markup for movie-details page
 */
function createDetailsMarkup() {
  /* Parsing JSONs */
  var details = JSON.parse(localStorage.getItem("details"));
  var cast = JSON.parse(localStorage.getItem("cast"));
  if (details==null) window.location.href="index.html"; // Go home if no data was set 
  /* Adding initial data */
  $(".movie-title").html(details.data.title);
  $(".movie-year").html("("+details.data.release_date.split("-")[0]+")");
  $(".movie-overview").html(details.data.overview);
  $(".movie-status").html(details.data.status);
  $(".movie-date").html(formatDate(details.data.release_date));
  $(".movie-budget").html(formatCurrency(details.data.budget));
  $(".movie-revenue").html(formatCurrency(details.data.revenue));
  if(!isFieldNullOrEmpty(details.data.poster_path)) $("#poster").attr("src", "https://image.tmdb.org/t/p/w780" + details.data.poster_path);
  /* Calling external functions to add data */
  createGenresMarkup(details.data.genres, $(".movie-genres")); // setting movie genres
  addCastMarkup(cast.data.cast, $(".movie-cast")); // Setting movie cast
  $(".movie-rating").replaceWith(createRatingMarkup(details.data.vote_average)); // setting rating
  createMoreDetails(cast.data.crew); // Setting the director and screenplay
  setupMasthead(details.data.backdrop_path); // Setting up the masthead
  $(".movie-duration").html(formatDuration(details.data.runtime)); // Setting Duration
  /* Fetching the language from languages JSON */
  addLanguage(details.data.original_language);
  
  /* Looping on the releases countries */
  $.each(details.data.releases.countries, function(index, value){
    if(value.iso_3166_1 == details.data.production_countries[0].iso_3166_1) {
      addCertificationDescription(value.certification); // Adding the certifications
    }
  });
  $(".flag").addClass(details.data.production_countries[0].iso_3166_1.toLowerCase()); // Setting the country flag
  addCountryTooltip(details.data.production_countries[0].name); // adding the country tool tip
}

/**
 * This function adjusts the heights of the cast cards on the compare page
 */
function adjustCardHeights(){
  /* Adjusting cast card height to match either column */
  var maxheight=0;
  var currentHeight=0;
  $(".mainCards .card").each(function(){ // Looping over all cast cards
    currentHeight=$(this).outerHeight();
    if(currentHeight > maxheight) // Finding the max height
    maxheight = currentHeight;
  });
  adjustHeights($(".first .mainCards > .header"), $(".second .mainCards > .header")); // Adjusting the header heights
  adjustHeights($(".first .genres"), $(".second .genres")); // Adjusting the genres heights  
  adjustHeights($(".description-1"), $(".description-2")); // Description heights
  adjustHeights($(".poster-1"), $(".poster-2")); // Poster Image heights
  adjustHeights($(".cast-cards-1"), $(".cast-cards-2")); // Cast Image heights
}

/**
 * This function builds the markup for the compare page
 */
function createComparePageMarkup () {
  var title_1 = JSON.parse(localStorage.getItem("title_1"));
    var title_2 = JSON.parse(localStorage.getItem("title_2"));
    var cast_1 = JSON.parse(localStorage.getItem("cast_1"));
    var cast_2 = JSON.parse(localStorage.getItem("cast_2"));
    if (title_1==null || title_2==null) window.location.href="index.html"; // Go home if no data was set 
    $(".title-1").html(title_1.data.title);
    $(".title-2").html(title_2.data.title);
    $(".date-1").html(returnNAString(title_1.data.release_date));
    $(".date-2").html(returnNAString(title_2.data.release_date));
    if(!isFieldNullOrEmpty(title_1.data.poster_path)) { // Checking if poster URL is valid 
      $(".poster-1").attr("src", "https://image.tmdb.org/t/p/w780" + title_1.data.poster_path);
    } else {
      $(".poster-1").attr("src", "images/fallback.png"); // Fallback image
    }
    if(!isFieldNullOrEmpty(title_1.data.poster_path)) { // Checking if poster URL is valid
      $(".poster-2").attr("src", "https://image.tmdb.org/t/p/w780" + title_2.data.poster_path);
    } else {
      $(".poster-2").attr("src", "images/fallback.png"); // Fallback image
    }
    $(".description-1").html(returnNAString(title_1.data.overview));
    $(".description-2").html(returnNAString(title_2.data.overview));

    addCastMarkup(cast_1.data.cast, $(".cast-cards-1")); // Adding cast markup for title 1 
    addCastMarkup(cast_2.data.cast, $(".cast-cards-2")); // Adding cast markup for title 2

    $(".rating-1").html(createRatingMarkup(title_1.data.vote_average)); // Adding rating bar for title 1
    $(".rating-2").html(createRatingMarkup(title_2.data.vote_average)); // Adding rating bar for title 2

    createGenresMarkup(title_1.data.genres, $(".genres-1")); // Adding genres markup for title 1 
    createGenresMarkup(title_2.data.genres, $(".genres-2")); // Adding genres markup for title 2

    $(".details-button-1").click(function(){
      showDetails(title_1.data.id); // Binding details button for title 1
    });
    $(".details-button-2").click(function(){
      showDetails(title_2.data.id); // Binding details button for title 2
    });
    $(".cast img").on('load', function(){
      adjustCardHeights();
      stickyHeaders();
    });
}

/**
 * Function that checks if a field is null or empty
 * @param  {[String]}  field The field that needs to be tested
 * @return {Boolean} True if it is null or empty, else false
 */
function isFieldNullOrEmpty(field) {
  if (typeof field !=undefined && field!=null && field!="") {
    return false; // Not null or empty
  } else {
    return true; // Null or empty or undefined
  }
}

/**
 * This function returns 'not available' if data is null or empty
 * @param  {[String]} field Field to be checked for null or empty
 * @return {[String]} Field as it is if not null or empty, else 'Not available'
 */
function returnNAString(field){
  if (isFieldNullOrEmpty(field)) { //checking if null or empty
    return "Not Available"; // Not available
  } else {
    return field; // reutning same field
  }
}

/**
 * Actions to perform once document is ready
 */
$(document).ready(function(){

  /* Added window load animation */
  $("body").fadeIn(1000);

  /* Defining logo click action */
  $(".logo").click(function(){
    window.location.href = "index.html"; // Sending back home
  });

  /* If results page is loaded */
  if($("#results-page").length!=0){
    if(!isFieldNullOrEmpty(localStorage.getItem("filter-year"))) {
      $("#filters-controls .input input").val(localStorage.getItem("filter-year"));
      $("#filters-controls").slideDown("1000");
    $("#filters-toggle").find("i").removeClass("down");
    $("#filters-toggle").find("i").addClass("up");
    }

  /* Binding year filter box to allow only number */
  $('#filters-controls .input input').keyup(function () { 
      this.value = this.value.replace(/[^0-9\.]/g,''); // regex to replace alphabets with numbers
      $(this).parent().removeClass("error"); // removing error class on key press in the input field
  });

    /* Binding the year filter */
    $(".filter-year").click(function(){
      var date = new Date();
      var inputYear = $("#filters-controls .input input").val();
      if(parseInt(inputYear) > date.getFullYear() || parseInt(inputYear) < 1900) {
        $(this).parent().addClass("error"); // Adding error class to field
      if($(".filter-error-message").is(":hidden")) { // Only if error is not already being displayed
        $(".filter-error-message").slideDown().delay(2000).slideUp(); // SHow error toast
      }
      } else {
        localStorage.setItem("filter-year", $("#filters-controls .input input").val());
        $("#search-form").submit();
      }
    });

    var results = JSON.parse(localStorage.getItem("results"));
    if (results==null) window.location.href="index.html";
    if (results.data!=null && results.data.results!=null && results.data.results!=0) { // Checking if results are present 
      createResultsMarkup(results.data.results); // Calling function to parse the JSON and create markup
      $("#main-search-field").val(localStorage.getItem("search-term"));
      $("#search-term").html(localStorage.getItem("search-term"));
      $("#results-count").html(localStorage.getItem('count'));
    // localStorage.getItem('pages');
      reloadCompareBar(); // Reload compare bar
    } else {
      // Show Zero Results 
      $("#main-search-field").val(localStorage.getItem("search-term"));
      $("#search-term").html(localStorage.getItem("search-term"));
      $("#results-count").html(localStorage.getItem('count'));
      var zeroResultsContainer = $("<div>").attr("class","ui small image zero-results");
      var zeroResults = $("<img>").attr("src", "images/zero.png");
      zeroResultsContainer.append(zeroResults);
      $("#results-holder").append(zeroResultsContainer);
      $("#results-holder").append($("<p>", {class:"whiteText zero-results-Text centerAlignedText marginTop30", html:"Please try another search term"}));
      $(".footer").css("cssText", 'position: absolute !important;bottom:-30px');
      
    }
  }

  /* Checking for compare page */
  if($("#compare-page").length!=0){
    createComparePageMarkup();
  }

  /* Checking for details page */
  if($("#details-page").length!=0){
    createDetailsMarkup();
  }

  /* Binding the click of the Search button */
  $("#search-form").on('submit', function(event){
    event.preventDefault();
    var inputField = document.getElementById("main-search-field");
    var params="";
    if(!isFieldNullOrEmpty(localStorage.getItem("filter-year"))) {
      if(inputField.value == "")
      inputField.value = localStorage.getItem('search-term'); // Resetting the search field value
      params="&year=" + localStorage.getItem("filter-year"); // setting param string as filter year
    }
    // Checking validity
    if (isEmpty(inputField)) {
      // Show error
      displayErrorToast(inputField);
    } else {
      $("#fakeLoader").fadeIn();
      /* Using Axios API to send request to TMDB */
      axios.get('https://api.themoviedb.org/3/search/movie?api_key=03f36b1d285bb38db672a6c9beac463a&query=' + encodeURIComponent(inputField.value)+ params)
      .then(function (response) {
        if (response!=null) {
          /* Setting Response into local storage */
          localStorage.setItem('results', JSON.stringify(response));
          localStorage.setItem('count', response.data.total_results);
          localStorage.setItem('pages', response.data.total_pages);
          localStorage.setItem('search-term', inputField.value);
              window.location.href="results.html"; // Navigate to results page
            }
      })
      .catch(function (error) {
        // console.log(error); Error
    });
      return false;
    }
  });

  /* if ghost container is found, adjust its position */
  if($("#ghost-container").length!=0){
    adjustTansparentBackdrop();
  }

  /* Initializing the particle background on the home page */
  try {
    $('.particle').particleground({
        dotColor: '#3a4270',
        lineColor: '#3a4270',
        density: 15000
    });
  } catch (e) {
    // Meaning the particles js has not been loaded
  }

  /* Code to toggle filter bar show / hide */
  $("#filters-toggle").click(function(){
    var controlsPanel = $("#filters-controls");

    /* Checking if the panel is visible */
    if(controlsPanel.is(":visible")){
      /* Hiding panel */
      controlsPanel.slideUp("1000");
      $(this).find("i").removeClass("up");
      $(this).find("i").addClass("down");
    } else {
      /* Displaying Panel */
      controlsPanel.slideDown("1000");
      $(this).find("i").removeClass("down");
      $(this).find("i").addClass("up");
    }
  });

  /* Binding the click of results cards - takes to details page */
  $("#results-page .card .primary").click(function(){
    showDetails($(this).next().attr('data'));
  });

  /* Binding the click of compare titles button once movies have been selected */
  $("#compare-titles").click(function(){
    comparisonPage();
  });

  /* Creating popup for the rating icon */
  if($('.ratingIcon').length!=0)
  $('.ratingIcon').popup();

  /* Binding the click of the scroll down button to take the user to the details section of the cards */
  $("#scroll-to-comparison").click(function(){
    this.blur(); // Removing focus from the clicked button
    $('html, body').animate({
      scrollTop: $(".mainCards").offset().top
    }, 500); // Animating the scroll to the details section of the cards
  });

  /* Binding the click of the scroll down button to take the user to the details of the movie */
  $("#scroll-to-details").click(function(){
    this.blur(); // Removing focus from the clicked button
    $('html, body').animate({
      scrollTop: $(".detailsRaisedRow").offset().top
    }, 500); // Animating the scroll to the details section of the cards
  });

  /* Binding compare / remove buttons to allow add to compare / remove from compare */
  $(".compare").click(function(e){
    var compareButton = $(this);
    if(compareButton.hasClass("disabled")) {
      compareButton.trigger("blur");
      $('.ui.modal.max-compare').modal('show'); // Show error modal
      return false;
    }
    compareButton.trigger("blur");
    var comparatorBar = $("#comparator-bar");
    var movieTitle = compareButton.attr("data");
    /* Initially disabling compare button on comparitor bar */
    $("#comparator-bar button").addClass("disabled");
    if(compareItems.indexOf(movieTitle)==-1) {
      /* Checking if the comparitor bar is not visible*/
      if(!comparatorBar.is(":visible")) {
        /* Displaying the compare bar */
        comparatorBar.fadeIn("1000");
        /* Scrolling in case the compare bar overlaps */
        $('html, body').animate({scrollTop: '+=50px'}, 500);
        /* Adding title to compare */
        addToCompare(compareButton, comparatorBar);
      } else if (comparatorBar.find("span").length != 2) {
        /* Adding title to compare */
        addToCompare(compareButton, comparatorBar);
      }
    } else {
      /* Removing title from compare */

      $("span").each(function(){
        if ($(this).attr("data") == movieTitle.split("_")[0]) {
          removeFromCompare(compareButton, comparatorBar, $(this));
        }
      });
    }
  });
});

/* Showing the transulcent ghost container once the window is rendered  */
$(window).on('load', function(){
  $("#fakeLoader").fadeOut();
  $("#ghost-container").show();
  if($(this).width()<=600) { // Checking for mobile device
    $(".breadcrumb").removeClass("huge"); // Making breadcrumbs small if mobile device
  }
  if($("#details-page").length!=0)
  $(".masthead-image").height($("#masthead-content").outerHeight()); // re adjust masthead image height
});

/* Resizing the ghost container if the window is resized */
$(window).resize(function() {
  if($("#ghost-container").length!=0)
  adjustTansparentBackdrop(); // adjusting backdrop ghost container on reseize
});