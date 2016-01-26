var tokens = {
	register: (req,res) => res.send("Here's a new token"),
	refresh: (req,res) => res.send("Not implemented yet")
}

module.exports = tokens;