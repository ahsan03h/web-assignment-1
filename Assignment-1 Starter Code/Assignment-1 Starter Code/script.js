let currentStack = [];
let filters = {};

const container = $(".container");
const currentitems = $(".current-stack");
const clearButton = $(".clear-btn");

clearButton.on("click", clearAllFilters);

$.getJSON("data.json", function (information) {
    createInitialElements(information);
}).then(function () {
    const filterItems = $("[data-label=filterItem]");

    filterItems.on("click", function (event) {
        let filterClone = $(this).clone();
        filterClone.attr("data-label", "filteredItem");
        if (!filters[$(this).text()]) {
            filterStack($(this).text(), filterClone);
            filteredEvent(filterClone);
        }
    });
});

// Add a function to delete a job listing
function deleteJob(index) {
    // Remove the job from the currentStack array
    currentStack.splice(index, 1);

    // Remove the job from the UI
    container.children().eq(index).remove();
}

function createInitialElements(peopleData) {
    $.each(peopleData, function (index, person) {
        let change = $("<div>").addClass("block flex flex--a-center flex--j-between").addClass(person.featured ? 'featured' : '');
        let element = `
            <div class="flex flex--a-center flex--name-gap">
                <img class="website-image" src="${person.logo}" alt="logo of website">
                <div class="flex flex--column flex--j-around flex--company-gap">
                    <div class="flex flex--a-center flex--feature-gap">
                        <p class="f-15 f-700 dd-cyan">${person.company}</p>
                        ${person.new ? '<div class="new dd-cyan-bg f-700">NEW!</div>' : ''}
                        ${person.featured ? '<div class="featured-true vdg-cyan-bg f-700">FEATURED</div>' : ''}
                    </div>
                    <p class="f-20 f-700">${person.position}</p>
                    <div class="flex flex--contract-gap">
                        <p class="n-links f-15 l-dark">${person.postedAt}</p>
                        <p class="n-links f-15 l-dark">${person.contract}</p>
                        <p class="n-links f-15 l-dark">${person.location}</p>
                    </div>
                </div>
            </div>
            <div class="flex flex--skills-gap">
                <button data-label="filterItem" class="f-14">${person.role}</button>
                <button data-label="filterItem" class="f-14">${person.level}</button>
                ${$.map(person.languages, function (language) {
                    return `<button data-label="filterItem" class="f-14">${language}</button>`;
                }).join("")}
                ${$.map(person.tools, function (tool) {
                    return `<button data-label="filterItem" class="f-14">${tool}</button>`;
                }).join("")}
            </div>
            <div class="flex flex--a-center">
                <button class="delete-btn f-14">Delete</button>
            </div>
        `;
        change.html(element);
        container.append(change);
        currentStack.push({
            attributes: [person.role, person.level, ...person.languages, ...person.tools],
            available: true,
            domElement: change
        });
    });

    // Add event listener for delete buttons
    $(".delete-btn").on("click", function () {
        const jobIndex = $(this).closest('.block').index();
        deleteJob(jobIndex);
    });
}

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

function checkFilterContainer() {
    if (currentitems.children("[data-label=filteredItem]").length > 0) {
        currentitems.removeClass("d-none");
    } else {
        currentitems.addClass("d-none");
    }
}

function filteredEvent(filter) {
    filter.on("click", function () {
        delete filters[filter.text()];
        filter.remove();
        checkFilterContainer();
        unFilterStack();
    });
}

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



function addNewJob(newJob) {
   fetch("data.json")
       .then(response => response.json())
       .then(data => {
           data.push(newJob);

           return fetch("data.json", {
               method: "POST",
               headers: {
                   "Content-Type": "application/json",
               },
               body: JSON.stringify(data),
           });
       })
       .then(() => {
           alert("Job added successfully!");
           createInitialElements([newJob]); // Update the UI with the new job
       })
       .catch(error => console.error("Error:", error));
}