const rules = {
	user: {
		static: [
			"campaigns:view",
		],
	},

	admin: {
		static: [
			"dashboard:view",
			"campaigns:view",
			"drawer-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
			"user-modal:editTags",
			"user-modal:editPermissions",
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
