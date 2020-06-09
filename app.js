//BUDGET CONTROLLER
var budgetController = (function(){
	
	//creating a data model for income and expense 
	var Expense = function(id, description, value) //use prototype to create functions of object
	{
		this.id = id;
		this.description = description;
		this.value = value;
		this.individualPercentage = -1;
	}

	var Income = function(id, description, value)
	{
		this.id = id;
		this.description = description;
		this.value = value;
	}

	Expense.prototype.calcPercentage = function (totIncome){

		if (totIncome > 0){
			this.individualPercentage = Math.round((this.value / totIncome) * 100);	
		}
		else{
			this.individualPercentage = -1
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.individualPercentage; 
	};

	//objects created using Expense and Income function Object are stored in data, ie in allitems
	var data = {
		allItems: {
			exp: [],
		   	inc: []
		},
		total: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	//calculate total income and expenses
	var calculate = function(type){
		var sum = 0;

		data.allItems[type].forEach(function(current){ //data.allitems[type].value.forEach(function(current){
			sum += current.value; //current will become our object containing id, value, descrip
		});

		data.total[type] = sum;
		// console.log(sum);
	}

	return {

		addItem: function(type, des, amount){
			var newItem, Id;

			//[1 2 3 4 5], next id = 6
			// after deleting certain elements [1 2 4 6 8], next id = 9
			// id = last_id + 1

			//create new id
			//when array is empty new id must be 0
			if(data.allItems[type].length > 0){
				Id = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}
			else{
				Id = 0;
			}

			// create new item based on 'inc' or 'exp' type
			if (type === 'inc'){
				newItem = new Income(Id, des, amount);
			}
			else{
				newItem = new Expense(Id, des, amount);	
			}
			
			//push it into our data structure
			data.allItems[type].push(newItem);
			
			//return the new item
			return newItem;

		},

		//BudgetController will call this method from function ctrlDeleteItem
		deleteItem: function(type, id){
			var ids, index;
			// console.log(type);

			// id = 3
			//ids = [1 3 4 7]
			// index = 1 and not 2
			ids = data.allItems[type].map(function(current){ //callback function, map creates a new array of the return elements
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1)
			{
				data.allItems[type].splice(index, 1); //removing elements at a particular index use splice
			}

		},

		calculateBudget: function(){
			//sum of all incomes
			calculate('inc');

			//sum of all expenses
			calculate('exp');

			//calculate budget = income - expenses
			data.budget = data.total.inc - data.total.exp;

			//calculate percentage of % expenses = expenses/income
			if (data.total.inc > 0){
				data.percentage = Math.round((data.total.exp / data.total.inc) * 100);	
			}
			else{
				data.percentage = -1;
			}
		},

		calculatePercentages : function(){

			data.allItems.exp.forEach(function(current){
				current.calcPercentage(data.total.inc);
			});
		},

		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});
			console.log(allPerc);
			return allPerc;
		},

		getBudget: function(){

			return{
				budget: data.budget,
				percentage: data.percentage,
				totalIncome: data.total.inc,
				totalExpense: data.total.exp
			}
		},

		testing: function(){
			console.log(data);
		}
	};

})();


//UI Controller
var UIController = (function (){

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription:'.add__description',
		inputAmount: '.add__value',
		inputButton: '.add__btn',
		incomeCont: '.income__list',
		expenseCont: '.expenses__list',
		budgetLabel: '.budget__value',
		budgetIncomeLabel: '.budget__income--value',
		budgetExpenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPerLabel: '.item__percentage'
	}

	//to create a public method in IIFE it should be returned by IIFE
	return{

		getinput: function(){ // will return to controller
			return {
				type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value, // will get user description
				amount: parseFloat(document.querySelector(DOMstrings.inputAmount).value) // will get the amount user entered, convert string to 
			};
		
		},

		addListItem : function(obj, type) {
			var html, newHTML, typ;
	
			//1. create HTML string with placeholder text
			if(type === 'inc')
			{
				html ='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
				typ = DOMstrings.incomeCont;
			}
			else if(type === 'exp')
			{
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
				typ = DOMstrings.expenseCont;
			}
			// console.log(typ);
			
			//2. Replace placeholder text with actual data
			newHTML = html.replace('%id%',obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%',obj.value);

			//3. Insert the HTML into the DOM
			var d1 = document.querySelector(typ);
			d1.insertAdjacentHTML('beforeend',newHTML);

		},

		deleteListItem : function(idSelector){
			//we need a class name or id to remove it
			//this case we will use id
			//In JS we can only remove child
			var child = document.getElementById(idSelector)
			child.parentNode.removeChild(child);
		},

		clearField : function() {
			var field, field_array;
			//querySelectorAll returns a list and not an array
			field = document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputAmount);

			//convert list to array
			field_array = Array.prototype.slice.call(field);

			field_array.forEach(function(current, index, array){ //callback function can receive upto 3 arguments
				current.value = "";
			});

			//Set focus on the 1st element again
			field_array[0].focus();
		},

		displayBudget: function(obj)
		{
			document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMstrings.budgetIncomeLabel).textContent = obj.totalIncome;
			document.querySelector(DOMstrings.budgetExpenseLabel).textContent = obj.totalExpense;
			


			if(obj.percentage >= 0)
			{
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}
			else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		//will receive percentage_array from controller
		displayPercentages: function(percentage_array){

			var fields = document.querySelectorAll(DOMstrings.expensesPerLabel); // will return a node list
			// console.log(fields);

			//this function is similar to for loop, for each iteration call callback function
			var nodeListForEach = function(list, callback){

				for(var i = 0; i<list.length; i++)
				{
					callback(list[i], i); // this callback function is passed as an argument just below 
				}

			}
			nodeListForEach(fields, function(current, index){// similar to forEach array

			   	if(percentage_array[index] >= 0)
			   	{
			   		current.textContent = percentage_array[index] + '%';
			   	}
			   	else
			   	{
			   		current.textContent = '---';
			   	}
			});

		},

		getDOMstrings: function(){
			return DOMstrings; // we are exposing the DOMstrings object into the public
		}
	};

})();


//Global App Controller - we call methods from UIcontroller and budget controller to use the data further
var controller = (function(budgetCtrl, UICtrl){

	var eventListeners = function(){

		var DOM = UICtrl.getDOMstrings(); //get dom strings from UIController object

		//Event listener 
		// The below function should run not only on button click but also when user hits 'Enter-Key'
		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

		//key press event happens on the global document
		document.addEventListener('keypress', function(event){
			//it should be executed only when "Enter key" is pressed, can be done by passing argument to the function
			//which property is for older browsers
			if (event.keyCode === 13 || event.which === 13) 
			{
				ctrlAddItem();
			}	
		});
		
		//event delegation
		//////////////////
		// We need the cancel button to work in both income and expense, thus attach the event handler to  <div class="container clearfix">
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

	}

	var updateBudget = function(){
		//5. calculate the budget
		budgetCtrl.calculateBudget();

		//6. return budget
		var budget = budgetCtrl.getBudget()
		// console.log(budget);

		//7. display the total budget on UI
		UICtrl.displayBudget(budget);
	}

	var updateExpensePercentage = function(){

		//similar to update budget function
		//1. calculate the percentages
		budgetCtrl.calculatePercentages();

		//2. read percentage from budget controller 
		var percentages = budgetCtrl.getPercentages();

		//3. update the UI with the new percentages
		console.log(percentages);
		UICtrl.displayPercentages(percentages);
	}

	var ctrlAddItem = function(){
		var input, newItem;

		//1. get the field input data
		input = UICtrl.getinput();
		// console.log(input);

		if(input.description !== "" && !isNaN(input.amount) && input.amount > 0)
		{
			//2. add the item to the budget controller, pass this object to addListItem method in UIController
			newItem = budgetCtrl.addItem(input.type, input.description, input.amount);

			//3. add the new item to the user interface
			UICtrl.addListItem(newItem, input.type);
			// console.log(input.type);

			//4. Clearing the field
			UICtrl.clearField();

			//5. Calculate and update budget
			updateBudget();

			//6. Calculate & update percentages
			updateExpensePercentage();
		}

	}

	var ctrlDeleteItem = function(event){ //in an anonymous function as well as in a callback function like this we have access to the event causing the action
		var itemId, splitId, type, id;

		// we need the event object because we want to know which element triggered the event
		//check which element triggered the event
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		//we need to move 4 times up the button to get the div we are interested in 

		//if id exists
		if(itemId)
		{
			//itemId = inc-1
			splitId = itemId.split('-'); // split method returns an array
			type = splitId[0];
			id =parseInt(splitId[1]);//this is a string and not a number

			//1. delete the item from the data structure 
			budgetCtrl.deleteItem(type, id);

			//2. delete the item from the UI
			UICtrl.deleteListItem(itemId);

			//3. Update and show the new budget
			updateBudget();

			//4. Calculate & update percentages
			updateExpensePercentage();

		}


	}
	//To call the eventListener functions which are now private in an iife we need to create an initialization function
	return{
		init: function(){
			// console.log('application has started');
			UICtrl.displayBudget({
				budget: 0,
				percentage: -1,
				totalIncome: 0,
				totalExpense: 0
			});
			eventListeners();
		}
	};	

})(budgetController, UIController);


controller.init();