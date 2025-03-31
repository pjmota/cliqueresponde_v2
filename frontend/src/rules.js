const rules = {
	user: {
<<<<<<< HEAD
		static: [
			"campaigns:view",
		],
=======
		static: [],
>>>>>>> organizacional/main
	},

	admin: {
		static: [
			"dashboard:view",
<<<<<<< HEAD
			"campaigns:view",
=======
>>>>>>> organizacional/main
			"drawer-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
<<<<<<< HEAD
			"user-modal:editTags",
=======
>>>>>>> organizacional/main
			"ticket-options:deleteTicket",
			"contacts-page:deleteContact",
			"connections-page:actionButtons",
			"connections-page:addConnection",
			"connections-page:editOrDeleteConnection",
			"tickets-manager:closeAll",
		],
	},
};

export default rules;
