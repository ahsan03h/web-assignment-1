// Initialize an empty array to store the current job listings and an empty object to store filters
let currentStack = [];
let filters = {};

// Select DOM elements using jQuery
const container = $(".container"); // Container for job listings
const currentitems = $(".current-stack"); // Container for filtered job listings
const clearButton = $(".clear-btn"); // Button to clear filters

// Attach a click event listener to the clear button to clear all filters
clearButton.on("click", clearAllFilters);

// Fetch JSON data from "data.json" and create initial job listings on the UI
$.getJSON("data.json", function (information) {
    createInitialElements(information);
}).then(function () {
    // Attach click event listeners to filter buttons
    const filterItems = $("[data-label=filterItem]");
    filterItems.on("click", function (event) {
        // Clone the clicked filter button and change its data-label to "filteredItem"
        let filterClone = $(this).clone();
        filterClone.attr("data-label", "filteredItem");
        // Check if the filter is not already applied, then filter the job listings
        if (!filters[$(this).text()]) {
            filterStack($(this).text(), filterClone);
            filteredEvent(filterClone);
        }
    });
});

// Function to delete a job listing from the currentStack
function deleteJob(index) {
    // Remove the job from the currentStack array
    currentStack.splice(index, 1);

    // Remove the job from the UI by its index
    container.children().eq(index).remove();
}

// Function to create initial job listings on the UI
function createInitialElements(peopleData) {
    $.each(peopleData, function (index, person) {
        // Create HTML elements for each job listing
        let change = $("<div>").addClass("block flex flex--a-center flex--j-between").addClass(person.featured ? 'featured' : '');
        let element = `
            <!-- HTML template for a job listing -->
        `;
        change.html(element);
        container.append(change);

        // Add the job listing to the currentStack array
        currentStack.push({
            attributes: [person.role, person.level, ...person.languages, ...person.tools],
            available: true,
            domElement: change
        });
    });

    // Attach click event listener for delete buttons
    $(".delete-btn").on("click", function () {
        const jobIndex = $(this).closest('.block').index();
        deleteJob(jobIndex);
    });
}

// Function to filter the job listings based on the selected filter
function filterStack(filter, element) {
    currentitems.prepend(element);
    $.each(currentStack, function (index, stack) {
        if (stack.available && !stack.attributes.includes(filter)) {
            stack.domElement.addClass("d-none");
            stack.available = false;
        }
    });
    filters[filter] = filter;
    checkFilterContainer();
}

// Function to check and update the visibility of the filter container
function checkFilterContainer() {
    if (currentitems.children("[data-label=filteredItem]").length > 0) {
        currentitems.removeClass("d-none");
    } else {
        currentitems.addClass("d-none");
    }
}

// Function to handle the click event on filtered items for removal
function filteredEvent(filter) {
    filter.on("click", function () {
        delete filters[filter.text()];
        filter.remove();
        checkFilterContainer();
        unFilterStack();
    });
}

// Function to unfilter job listings
function unFilterStack() {
    const filterKeys = Object.keys(filters);
    $.each(currentStack, function (index, stack) {
        let check = filterKeys.every(key => stack.attributes.includes(key));
        if (check) {
            stack.domElement.removeClass("d-none");
            stack.available = true;
        }
    });
}

// Function to clear all applied filters
function clearAllFilters() {
    const filterItems = $("[data-label=filteredItem]");
    filterItems.remove();
    $.each(currentStack, function (index, stack) {
        stack.domElement.removeClass("d-none");
        stack.available = true;
    });
    checkFilterContainer();
}

$(document).ready(function () {
    // Attach a click event listener to open the popup
    const openButton = $("#openPopup");
    const popupContainer = $("#popupContainer");

    openButton.on("click", function () {
        // Create an iframe to load the popup HTML file
        const iframe = $("<iframe>").attr({
            src: "popupAdd.html",
            style: "position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);border:none;z-index:1000;width:500px;height:300px;"
        });

        // Append the iframe to the popupContainer
        popupContainer.append(iframe);
    });
});

// Function to add a new job to the data.json file
function addNewJob(newJob) {
   fetch("data.json")
       .then(response => response.json())
       .then(data => {
           // Push the new job to the data array
           data.push(newJob);

           // Send a POST request to update the data.json file
           return fetch("data.json", {
               method: "POST",
               headers: {
                   "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
           });
       })
       .then(() => {
           // Show a success alert and update the UI with the new job
           alert("Job added successfully!");
           createInitialElements([newJob]);
       })
       .catch(error => console.error("Error:", error));
}
