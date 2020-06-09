//BUDGET CONTROLLER
var budgetController = (function(){
	
	//creating a data model for income and expense 
	var Expense = function(id, description, value) //use prototype to create functions of object
	{
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var Income = function(id, description, value)
	{
		this.id = id;
		this.description = description;
		this.value = value;
	}

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
		percentageLabel: '.budget__expenses--percentage'
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
				html ='<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
				typ = DOMstrings.incomeCont;
			}
			else if(type === 'exp')
			{
				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
				typ = DOMstrings.expenseCont;
			}
			console.log(typ);
			
			//2. Replace placeholder text with actual data
			newHTML = html.replace('%id%',obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%',obj.value);

			//3. Insert the HTML into the DOM
			var d1 = document.querySelector(typ);
			d1.insertAdjacentHTML('beforeend',newHTML);

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
	}

	var updateBudget = function(){
		//5. calculate the budget
		budgetCtrl.calculateBudget();

		//6. return budget
		var budget = budgetCtrl.getBudget()
		console.log(budget);

		//7. display the total budget on UI
		UICtrl.displayBudget(budget);
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

			//8. Calculate and update budget
			updateBudget();
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