import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
}));

const PermissionSelect = ({ selectedPermissionIds, onChange, multiple = true, title = i18n.t("Permissões"), noColor = false }) => {
	const classes = useStyles();
	const [permissions, setPermissions] = useState([]);

	useEffect(() => {

		fetchPermissions();

	}, []);

	const fetchPermissions = async () => {
		try {
			const { data } = await api.get("/permissions");
			setPermissions(data.permissions);
		} catch (err) {
			toastError(err);
		}
	}

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel shrink={multiple ? !!selectedPermissionIds?.length : !!selectedPermissionIds} >{title}</InputLabel>
				<Select
					label={title}
					multiple={multiple}
					labelWidth={60}
					value={selectedPermissionIds ?? ''}
					onChange={handleChange}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
						getContentAnchorEl: null,
					}}

					renderValue={selected => {
						return (
							<div className={classes.chips}>
								{selected?.toString().length > 0 && multiple && !noColor ? (
									selected.map(id => {
										const permission = permissions.find(q => q.id === id);
										return permission ? (
											<Chip
												key={id}
												variant="outlined"
												label={permission.name}
												className={classes.chip}
											/>
										) : null;
									})

								) : selected?.toString().length > 0 && !multiple && !noColor ?
									(
										<Chip
											key={selected}
											variant="outlined"
											label={permissions.find(q => q.id === selected)?.name}
											className={classes.chip}
										/>
									) : (
										<>
										{ permissions.find(q => q.id === selected)?.name }
										</>
									)
								}

							</div>
						)
					}}
				>
					{!multiple && <MenuItem value={null}>Nenhum</MenuItem>}
					{permissions.map(permission => (
						<MenuItem key={permission.id} value={permission.id}>
							{permission.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default PermissionSelect;
