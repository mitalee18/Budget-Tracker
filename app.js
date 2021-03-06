//BUDGET CONTROLLER
var budgetController = (function(){
	
	//creating a data model for income and expense 
	var Expense = function(id, description, value, category) //use prototype to create functions of object
	{
		this.id = id;
		this.description = description;
		this.value = value;
		this.individualPercentage = -1;
		this.category = category;
	};

	var Income = function(id, description, value)
	{
		this.id = id;
		this.description = description;
		this.value = value;
	};

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

	var chart_data = {
		budget: 0,
		food: 0,
		clothing: 0,
		transport: 0,
		entertainment: 0,
		others: 0
	}

	//calculate total income and expenses
	var calculate = function(type){
		var sum = 0;

		data.allItems[type].forEach(function(current){ //data.allitems[type].value.forEach(function(current){
			sum += current.value; //current will become our object containing id, value, descrip
		});

		data.total[type] = sum;
		// console.log(sum);
	};

	return {

		addItem: function(type, des, amount, category){
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
				newItem = new Expense(Id, des, amount, category);	
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
			// console.log(allPerc);
			return allPerc;
		},

		calculateCategory: function(){
			//do somethings
			//club different categories together and return them to controller for further processing
			var food, clothing, transport, entertainment, others, budget, val;
			food = 0;
			clothing = 0;
			transport = 0;
			entertainment = 0;
			others = 0;
			budget = 0;

			budget = (data.budget / data.total.inc) * 100
			chart_data.budget = budget;
			if(data.allItems.exp.length !== 0)
			{
				for(var i = 0; i < data.allItems.exp.length; i++)
				{	
					val = data.allItems.exp[i].individualPercentage;

					switch(data.allItems.exp[i].category)
					{
					case 'Food': food += val;
								 chart_data.food = food;
								 break;
					case 'Clothing': clothing += val;
								 chart_data.clothing = clothing;
								 break;
					case 'Transport': transport += val;
								 chart_data.transport = transport;
								 break;
					case 'Entertainment': entertainment += val;
								 chart_data.entertainment = entertainment;
								 break;
					case 'Others': others += val;
								 chart_data.others = others;
								 break;
					}
				}
			}
			else
			{
				chart_data.food = food;
				chart_data.clothing = clothing;
				chart_data.transport = transport;
				chart_data.entertainment = entertainment;
				chart_data.others = others;
			}

			var field = [chart_data.budget, chart_data.food, chart_data.clothing, chart_data.transport, chart_data.entertainment, chart_data.others];
			return field;

		},

		getBudget: function(){

			return{
				budget: data.budget,
				percentage: data.percentage,
				totalIncome: data.total.inc,
				totalExpense: data.total.exp
			};
		},

		testing: function(){
			console.log(data);
			console.log(chart_data);
		}
	};

})();


//UI Controller
var UIController = (function (){

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription:'.add__description',
		inputCategory: '#output',
		inputAmount: '.add__value',
		inputButton: '.add__btn',
		incomeCont: '.income__list',
		expenseCont: '.expenses__list',
		budgetLabel: '.budget__value',
		budgetIncomeLabel: '.budget__income--value',
		budgetExpenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPerLabel: '.item__percentage',
		dateLabel: '.budget__title--month',
	}

	var formatNum = function(num, type){
			var numSplit, int, dec, sign;

			/* 
			+ or - before the number
			exactly 2 decimal points
			comma separating the thousands

			2310.457 -> +2,310.46
			2000 --> + 2,000.00
			*/

			num = Math.abs(num);
			num = num.toFixed(2); //method of number prototype

			numSplit = num.split('.');

			int = numSplit[0];
			if(int.length) // will give us number of total digits present in our number // here our number is a string
			{
				if(int.length>3)
				{
					int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3); //input: 2310 output: 2,310
					//input: 23510, output: 23,510
				}
				
			}
			dec = numSplit[1];

			return (type === 'exp' ? '-' : '+') +' '+ int + '.'+dec;
		};

	//this function is similar to for loop, for each iteration call callback function
	var nodeListForEach = function(list, callback){

		for(var i = 0; i<list.length; i++)
		{
			callback(list[i], i); // this callback function is passed as an argument just below 
		}
	};


	//to create a public method in IIFE it should be returned by IIFE
	return{

		getinput: function(){ // will return to controller
			
			if(document.querySelector(DOMstrings.inputType).value === 'inc')
			{ return{
					type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
					description: document.querySelector(DOMstrings.inputDescription).value, // will get user description
					amount: parseFloat(document.querySelector(DOMstrings.inputAmount).value) // will get the amount user entered, convert string to
				};
			}
			else
			{  return{
					type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
					description: document.querySelector(DOMstrings.inputDescription).value, // will get user description
					amount: parseFloat(document.querySelector(DOMstrings.inputAmount).value), // will get the amount user entered, convert string to
					category: document.querySelector(DOMstrings.inputCategory).value
				};
			} 
		
		
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
			newHTML = newHTML.replace('%value%',formatNum(obj.value, type));

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
			obj.budget > 0 ? type = 'inc': type = 'exp'
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budget, type);
			document.querySelector(DOMstrings.budgetIncomeLabel).textContent = formatNum(obj.totalIncome, 'inc');
			document.querySelector(DOMstrings.budgetExpenseLabel).textContent = formatNum(obj.totalExpense, 'exp');
		

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
			// var nodeListForEach = function(list, callback){

			// 	for(var i = 0; i<list.length; i++)
			// 	{
			// 		callback(list[i], i); // this callback function is passed as an argument just below 
			// 	}

			// }

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

		//call from updateCategory from controller
		generateGraph: function(fields){
            var myChart = document.getElementById('myChart').getContext('2d');

    		var massPopChart = new Chart(myChart, {
       		       type: 'doughnut', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
        		   data: {
            	           labels: ['Budget', 'Food', 'Clothing','Transport', 'Entertainment', 'Others'],
            	           datasets: [{
                                        label: 'Budget Tracker',
                		                data: fields,
                                        backgroundColor: [
                                                '#97cc04',
                                                '#323031',
                                                '#ffc857',
                                                '#db3a34',
                                                '#084c61',
                                                '#177e89',
                                        ],
                                        borderWidth: 0,
                                        hoverBorderWidth: 3,
                                        hoverBorderColor: 'White'
                            }]
                    },
                    options: {
                            title: {
                                text: '% of expenses and remaining budget',
                                display: true,
                                fontSize: 18,
                                fontColor: 'White'
                            },
                            legend: {
                                position: 'right',
                                labels:{
                                    fontColor: 'White'
                            }
                    }
                }
            });	
            document.querySelector('.chart').style.display = 'block';
		},

		//calling from init function in controller
		displayMonth: function(){
			var now, year, month, months;
			
			months = ['January', 'February','March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changedType: function(){
			var cat, catOption;
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ','+
				DOMstrings.inputDescription+','+
				DOMstrings.inputAmount+','+
				DOMstrings.inputCategory);

			var options = {
				inc: {
					salary: 'Salary',
					freelancing: 'Freelancing',
					stocks: 'Stocks',
					others: 'Others'
				},
				exp: {
					food: 'Food',
					clothing: 'Clothing',
					transport: 'Transport',
					entertainment: 'Entertainment',
					others: 'Others'
				}
			}
			nodeListForEach(fields, function(current){
				current.classList.toggle('green-focus'); //to add redfocus as a class we use classList.toggle to toggle. Ie if we have red-focus class it will remove it and if we don't it will add it.
			});

			catOption = ""
			if (document.querySelector(DOMstrings.inputType).value === 'exp')
			{	
				for (cat in options.exp)
				{
					catOption += "<option>"+options.exp[cat]+'</option>';
				}
				
			}
			else
			{
				for (cat in options.inc)
				{
					catOption += "<option>"+options.inc[cat]+'</option>';
				}
			}
			document.getElementById('output').innerHTML = catOption;
			document.querySelector(DOMstrings.inputButton).classList.toggle('green');
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

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)

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
		// console.log(percentages);
		UICtrl.displayPercentages(percentages);
	}

	// called from ctrlAddItem() in controller
	var updateCategory = function(){
		//1. calculate % of each category from budgetCtrl
		var fieldsArr = budgetCtrl.calculateCategory();
		console.log(fieldsArr);

		//2. Update Graph in UI
		UICtrl.generateGraph(fieldsArr);

	}

	var ctrlAddItem = function(){
		var input, newItem;

		//1. get the field input data
		input = UICtrl.getinput();
		// console.log(input);

		if(input.description !== "" && !isNaN(input.amount) && input.amount > 0)
		{
			//2. add the item to the budget controller, pass this object to addListItem method in UIController
			if(input.type === 'inc')
			{
				newItem = budgetCtrl.addItem(input.type, input.description, input.amount, null);	
			}
			else
			{
				newItem = budgetCtrl.addItem(input.type, input.description, input.amount, input.category);
			}

			//3. add the new item to the user interface
			UICtrl.addListItem(newItem, input.type);
			// console.log(input.type);

			//4. Clearing the field
			UICtrl.clearField();

			//5. Calculate and update budget
			updateBudget();

			//6. Calculate & update percentages
			updateExpensePercentage();

			//7. Update Category percentage
			updateCategory();
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

			//5. Update Category percentage
			updateCategory();

		}


	}
	//To call the eventListener functions which are now private in an iife we need to create an initialization function
	return{
		init: function(){
			// console.log('application has started');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				percentage: -1,
				totalIncome: 0,
				totalExpense: 0
			});
			eventListeners();
			//chart
			document.querySelector('.chart').style.display = 'none';
			// document.querySelector('.add__category').style.display = 'none';
		}
	};	

})(budgetController, UIController);


controller.init();