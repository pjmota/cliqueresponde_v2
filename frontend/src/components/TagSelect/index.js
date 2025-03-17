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

const TagSelect = ({ selectedTagIds, onChange, multiple = true, title = i18n.t("Tags"), noColor = false, kanbam = 0 }) => {
	const classes = useStyles();
	const [tags, setTags] = useState([]);

	useEffect(() => {

		fetchTags();

	}, []);

	const fetchTags = async () => {
		try {
			const { data } = await api.get("/tags", {
        params: {
          kanban: kanbam
        }
      });
			setTags(data.tags);
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
				<InputLabel shrink={multiple ? !!selectedTagIds?.length : !!selectedTagIds} >{title}</InputLabel>
				<Select
					label={title}
					multiple={multiple}
					labelWidth={60}
					value={selectedTagIds ?? ''}
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
										const tag = tags.find(q => q.id === id);
										return tag ? (
											<Chip
												key={id}
												style={{ backgroundColor: tag.color }}
												variant="outlined"
												label={tag.name}
												className={classes.chip}
											/>
										) : null;
									})

								) : selected?.toString().length > 0 && !multiple && !noColor ?
									(
										<Chip
											key={selected}
											variant="outlined"
											style={{ backgroundColor: tags.find(q => q.id === selected)?.color }}
											label={tags.find(q => q.id === selected)?.name}
											className={classes.chip}
										/>
									) : (
										<>
										{ tags.find(q => q.id === selected)?.name }
										</>
									)
								}

							</div>
						)
					}}
				>
					{!multiple && <MenuItem value={null}>Nenhum</MenuItem>}
					{tags.map(tag => (
						<MenuItem key={tag.id} value={tag.id}>
							{tag.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default TagSelect;