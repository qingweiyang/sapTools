Array.prototype.remove = function(s) {  
    for (var i = 0; i < this.length; i++) {  
        if (s == this[i])  
            this.splice(i, 1);  
    }  
}  

Array.prototype.removeAt = function(i) {  
    this.splice(i, 1);   
} 

function HashMap(){
	var size = 0;
	var data = new Object();

	this.put = function(key, value){
		if(!this.containsKey(key)){
			++size;
		}
		data[key] = value;
	}

	this.get = function(key){
		var value = null;
		if(this.containsKey(key)){
			value = data[key];
		}
		return value;
	}

	this.remove = function(key){
		if(this.containsKey(key)){
			if(delete data[key]){
				--size;
			}
		}
	}

	this.containsKey = function(key){
		return (key in data);
	}

	this.containsValue = function(value){
		var ret = false;
		for(var prop in data){
			if(data[prop] == value){
				ret = true;
				break;
			}
		}
		return ret;
	}

	this.values = function(){
		var values = new Array(size);
		for(var prop in data){
			values.push(data[prop]);
		}
		return values;
	}

	this.keys = function(){
		var keys = new Array(size);
		for(var prop in data){
			keys.push(prop);
		}
		return keys;
	}

	this.size = function(){
		return size;
	}

	this.clear = function(){
		for(var prop in data){
			this.remove(prop);
		}
	}

}