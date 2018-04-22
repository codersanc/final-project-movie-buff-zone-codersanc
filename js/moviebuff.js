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
  setCompareCookie(addToCompareButton);

  /* Binding the 'x' icon on the token to remove it */
  token.find("i").click(function(){
    removeFromCompare(addToCompareButton, comparatorBar, token);
  });

  /* If 2 items have already been added for compare */
  if(comparatorBar.find("span").length == 2) {
    /* Enabling compare button on the comparitor bar */
    $("#comparator-bar button").removeClass("disabled");
    $(".compare").addClass("disabled"); /* Disable other buttons */
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
 * This function sets the comparison title in the Cookie
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare button that was clicked 
 */
function setCompareCookie(addToCompareButton){
  if(typeof Cookies === 'undefined')
  return null;
  var titles = [];
  /* Fetching the Cookie */
  var cookieValue = Cookies.get("title");
  /* Checking if cookie was stored or null */ 
  if (typeof cookieValue != 'undefined' && cookieValue!=null) {
    titles = cookieValue.split(","); // Splitting by comma
  }
  /* Adding the new title to the array */
  titles.push(addToCompareButton.attr("data"));
  /* Setting the cookie */
  Cookies.set('titles', JSON.stringify(titles), {
    expires:2
  });
}

/**
 * This function removes the comparison title from the Cookie
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare button that was clicked 
 */
function removeCompareCookie(addToCompareButton) {
  if(typeof Cookies === 'undefined')
  return null;
  var titles = [];
  /* Fetching the Cookie */
  var cookieValue = Cookies.get("title");
  if (typeof cookieValue != 'undefined' && cookieValue!=null) {
    titles = cookieValue.split(","); // Splitting by comma
  }
  /* Checking at which index the title is */
  var index = $.inArray(addToCompareButton.attr("data"), titles);
  /* Removing the title from the array */
  if (index>=0) titles.splice(index, 1);
  /* Setting the new array in the cookie */
  Cookies.set('titles', JSON.stringify(titles), {
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
  removeCompareCookie(addToCompareButton);

  /* Enabling all compare buttons as we are no longer at limit */
  $(".compare").removeClass("disabled");
  token.remove();

  /* If 2 items have already been added for compare */
  if(comparatorBar.find("span").length == 0) {
    comparatorBar.fadeOut("1000");
    $("div").last().prev().css("margin-bottom", "60px");
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

  /* Text Node to be inserted into the token span (Obtained from data attr of the add to compare button) */
  var tokenContent = addToCompareButton.attr("data").split("_")[1];
  compareItems.push(addToCompareButton.attr("data"));

  /* Adding token content to the data attr */
  token.attr("data", addToCompareButton.attr("data").split("_")[0]);

  /* Created token delete icon */
  var tokenIcon = $("<i class='delete icon'></i>");

  /* Appending newly created token elements */
  token.append(tokenContent).append(tokenIcon);
  comparatorBar.append(token);

  return token;
}

/* This function takes the user to the details page of the movie */
function showDetails(button) {
	axios.get('https://api.themoviedb.org/3/movie/' + $(button).next().attr('data') + '?api_key=03f36b1d285bb38db672a6c9beac463a&language=en-US')
	  .then(function (response) {
	  	if (response!=null) {
		  	/* Setting Response into local storage */
		    localStorage.setItem('details', JSON.stringify(response));
		    window.location.href="details.html";  // Redirecting to Details page
        }
	  })
	  .catch(function (error) {
	    // console.log(error); Error
	});
}

/* his function takes the user to the comparison page */
function comparisonPage(){
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

/* Adjusts the height of the ghost container backdrop */
function adjustTansparentBackdrop(){
	$("#ghost-container").height($("#main-container").outerHeight());
	$("#ghost-container").offset({top:$("#main-container").offset().top, left: 0});
}

/* Adjust heights of elements to equate them */
function adjustHeights(firstElement, secondElement){
	var firstElementHeight = firstElement.outerHeight(); // Getting the height of the first element
    var secondElementHeight = secondElement.outerHeight(); // Getting the height of the second elements
    if (firstElementHeight>secondElementHeight){ // Comparing heights and setting to the larger value
      secondElement.css("cssText", "height:" + firstElementHeight + "px !important"); 
    } else {
      firstElement.css("cssText", "height:" + secondElementHeight + "px !important"); 
    }
}

/* This function handles the headers of the compare cards (Sticks on scrolling below them) */
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

/* Function that checks if form element's value is blank */
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

/* This function displays the error toast message */
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

/* This function generates the results cards markup using the results JSON object */
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

/* This function generates the cast cards for the compare page */
function createCastMarkup(value) {
	var card = $("<div>", {class: "card"});
	  var imageContainer = $("<div>", {class: "image"});
	    var image = $("<img>", {src: "https://image.tmdb.org/t/p/w780" + value.profile_path});
	  var content = $("<div>", {class: "content"});
	    var celebrity = $("<div>", {class: "header", html: value.name});
	    var character = $("<div>", {class: "meta", html: value.character});

	content.append(celebrity).append(character);
	imageContainer.append(image);
	card.append(imageContainer).append(content);
	return card;
}

/* This function adds the cast cards to the target */
function addCastMarkup(object, target) {
	var limit=4;
	if(object.length==0){
		target.html("Not Available"); // If no cast info available
	}
	$.each(object, function(index, value){ // Loop on each cast member
		if (isFieldNullOrEmpty(value.profile_path)) {
			limit++;
			return true;
		}
		if (index==limit) return false; // Run for only top 4 cast members
		target.append(createCastMarkup(value)); // add the markup to the target
    });
}

/* This function creates the rating bar markup for the compare page */
function createRatingMarkup(value) {

	if(!isFieldNullOrEmpty(this.vote_average) && this.vote_average!=0){ // If rating is valid
	  /*Initializing progress bar */
      var progressContainer = $("<div>", {class: "ui small indicating progress active"}).attr("data-percent", value.vote_average).attr("data-tooltip","User Rating").attr("data-inverted","");
	  var progressBar = $("<div>", {class:"bar", style:"transition-duration:300ms;width:" + (value.vote_average*10) + "%;"});
	    var progress = $("<div>", {class:"progress"});
	  var progressLabel = $("<div>", {class: "label", html: (value.vote_average*10) + "%"});
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

/* This function generates markup for the genres on the compare page */
function addGenresMarkup(object, target) {
	if(object.length==0){
		target.html("Not Available"); // If no cast info available
	}
	$.each(object, function(index, value){ // Loop on each cast member 
		var progressLabel = $("<p>", {class: "ui inverted segment inlineBlock", html: value.name}); 
		if (index==4) return false; // Run for only top 4 cast members
		target.append(progressLabel); // add the markup to the target
    });
	
}

/* This function adjusts the heights of the cast cards on the compare page */
function adjustCardHeights(){
	/* Adjusting cast card height to match either column */
	var maxheight=0;
	var currentHeight=0;
	$(".mainCards .card").each(function(){ // Looping over all cast cards
		currentHeight=$(this).outerHeight();
		if(currentHeight > maxheight) // Finding the max height
		maxheight = currentHeight;
	});
	$(".mainCards .card").css("cssText", "height:" + maxheight + "px !important"); // Setting all cards to max height 
	adjustHeights($(".first .mainCards > .header"), $(".second .mainCards > .header")); // Adjusting the header heights
	adjustHeights($(".first .genres"), $(".second .genres")); // Adjusting the genres heights  
	adjustHeights($(".poster-1"), $(".poster-2")); // Poster Image heights
	adjustHeights($(".cast-cards-1"), $(".cast-cards-2")); // Poster Image heights
	adjustHeights($(".description-1"), $(".description-2")); // Poster Image heights
}

/* This function builds the markup for the compare page */
function buildComparePageMarkup () {
	var title_1 = JSON.parse(localStorage.getItem("title_1"));
  	var title_2 = JSON.parse(localStorage.getItem("title_2"));
  	var cast_1 = JSON.parse(localStorage.getItem("cast_1"));
  	var cast_2 = JSON.parse(localStorage.getItem("cast_2"));
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

  	$(".rating-1").html(createRatingMarkup(title_1.data)); // Adding rating bar for title 1
  	$(".rating-2").html(createRatingMarkup(title_2.data)); // Adding rating bar for title 2

  	addGenresMarkup(title_1.data.genres, $(".genres-1")); // Adding genres markup for title 1 
  	addGenresMarkup(title_2.data.genres, $(".genres-2")); // Adding genres markup for title 2
}

/* Function that checks if a field is null or empty */
function isFieldNullOrEmpty(field) {
	if (typeof field !=undefined && field!=null && field!="") {
		return false; // Not null or empty
	} else {
		return true; // Null or empty or undefined
	}
}

/* This function returns 'not available' if data is null or empty */
function returnNAString(field){
	if (isFieldNullOrEmpty(field)) { //checking if null or empty
		return "Not Available"; // Not available
	} else {
		return field; // reutning same field
	}
}

/* Actions to perform once document is ready */
$(document).ready(function(){

  /* Added window load animation */
  $("body").fadeIn(1000);
  
  /* Settibg nasthead image dimensions */
  $(".masthead-image").width($(".masthead").outerWidth());
  if($(window).width()<=600) {
  	//$(".masthead-image").height($("#masthead-content").outerHeight());
  } else {
  	$(".masthead-image").height($(".masthead").outerHeight());
  }

  /* Defining logo click action */
  $(".logo").click(function(){
    window.location.href = "index.html"; // Sending back home
  });

  /* If results page is loaded */
  if($("#results-page").length!=0){
  	var results = JSON.parse(localStorage.getItem("results"));
  	if (results.data!=null && results.data.results!=null) { // Checking if results are present 
  		createResultsMarkup(results.data.results); // Calling function to parse the JSON and create markup
  		$("#main-search-field").val(localStorage.getItem("search-term"));
  		$("#search-term").html(localStorage.getItem("search-term"));
  		$("#results-count").html(localStorage.getItem('count'));
		// localStorage.getItem('pages');
  	} else {
  		// Show Zero Results 
  	}
  }

  /* Checking for compare page */
  if($("#compare-page").length!=0){
  	buildComparePageMarkup();
  }
  /* Binding the click of the Search button */
  $("#search-form").on('submit', function(event){
  	event.preventDefault();
  	var inputField = document.getElementById("main-search-field");
  	// Checking validity
  	if (isEmpty(inputField)) {
  		// Show error
  		displayErrorToast(inputField);
  	} else {
  		/* Using Axios API to send request to TMDB */
  		axios.get('https://api.themoviedb.org/3/search/movie?api_key=03f36b1d285bb38db672a6c9beac463a&query=' + encodeURIComponent(inputField.value))
		  .then(function (response) {
		  	if (response!=null) {
			  	/* Setting Response into local storage */
			    localStorage.setItem('results', JSON.stringify(response));
			    localStorage.setItem('count', response.data.total_results);
			    localStorage.setItem('pages', response.data.total_pages);
			    localStorage.setItem('search-term', inputField.value);

	            window.location.href="results.html";
            }
		  })
		  .catch(function (error) {
		    // console.log(error); Error
		});

  		//this.submit();
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
        dotColor: '#2d3354',
        lineColor: '#2d3354',
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
    } else {
      /* Displaying Panel */
      controlsPanel.slideDown("1000");
    }
  });

  /* Binding the click of results cards - takes to details page */
  $(".card .primary").click(function(){
    showDetails(this);
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

  /* Compare page: Making sticky headers of cards */
  if($("#compare-page").length!=0)
  stickyHeaders();

  /* Binding compare / remove buttons to allow add to compare / remove from compare */
  $(".compare").click(function(e){
  	$(this).trigger("blur");
    var comparatorBar = $("#comparator-bar");
    var movieTitle = $(this).attr("data");
    /* Initially disabling compare button on comparitor bar */
    $("#comparator-bar button").addClass("disabled");
    if(compareItems.indexOf(movieTitle)==-1) {
      /* Checking if the comparitor bar is not visible*/
      if(!comparatorBar.is(":visible")) {
        /* Displaying the compare bar */
        comparatorBar.fadeIn("1000");
        /* Adding margin to the bottom of the page and scrolling in case the compare bar overlaps */
        $("div").last().prev().css("margin-bottom", "70px");
        $('html, body').animate({scrollTop: '+=50px'}, 500);
        /* Adding title to compare */
        addToCompare($(this), comparatorBar);
      } else if (comparatorBar.find("span").length != 2) {
        /* Adding title to compare */
        addToCompare($(this), comparatorBar);
      }
    } else {
      /* Removing title from compare */
      removeFromCompare($(this), comparatorBar, $("span[data='" + movieTitle.split("_")[0] + "']"));
    }
  });
});

/* Showing the transulcent ghost container once the window is rendered  */
$(window).on('load', function(){
	$("#ghost-container").show();
	if($(this).width()<=600) { // Checking for mobile device
		$(".breadcrumb").removeClass("huge"); // Making breadcrumbs small if mobile device
	}
	if($("#compare-page").length!=0) adjustCardHeights();
});

/* Resizing the ghost container if the window is resized */
$(window).resize(function() {
  if($("#ghost-container").length!=0)
  adjustTansparentBackdrop(); // adjusting backdrop ghost container on reseize
});