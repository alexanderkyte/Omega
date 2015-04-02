var command_names = ["approve", "disapprove"];

module.exports = function(bot_name){
	var accum = [];
	for(var i = 0; i < command_names.Length; i++){
		accum.push({
			name: command_names[i],
			regex: new RegExp(bot_name + "\\w+" + command_names[i], i)
		});
	}
	return accum;
}
