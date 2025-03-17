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

const useStyles = makeStyles((theme) => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const QueueIntegrationSelect = ({
  selectedQueueIntegrationIds,
  onChange,
  multiple = true,
  title = i18n.t("Integrações"),
  noColor = false,
}) => {
  const classes = useStyles();
  const [queueIntegration, setQueueIntegration] = useState([]);

  useEffect(() => {
    fetchQueueIntegrations();
  }, []);

  const fetchQueueIntegrations = async () => {
    try {
      const { data } = await api.get("/queueIntegration");
      setQueueIntegration(data.queueIntegrations);
    } catch (err) {
      toastError(err);
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel shrink={selectedQueueIntegrationIds ? true : false}>{title}</InputLabel>
        <Select
          label={title}
          multiple={multiple}
          labelWidth={60}
          value={selectedQueueIntegrationIds}
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
          renderValue={(selected) => {
            return (
              <div className={classes.chips}>
                {selected?.toString().length > 0 && multiple && !noColor ? (
                  selected.map((id) => {
                    const queueIntegration = queueIntegration.find((q) => q.id === id);
                    return queueIntegration ? (
                      <Chip
                        key={id}
                        style={{ backgroundColor: queueIntegration.color }}
                        variant="outlined"
                        label={queueIntegration.name}
                        className={classes.chip}
                      />
                    ) : null;
                  })
                ) : selected?.toString().length > 0 && !multiple && !noColor ? (
                  <Chip
                    key={selected}
                    variant="outlined"
                    style={{
                      backgroundColor: queueIntegration.find((q) => q.id === selected)
                        ?.color,
                    }}
                    label={queueIntegration.find((q) => q.id === selected)?.name}
                    className={classes.chip}
                  />
                ) : (
                  <>{queueIntegration.find((q) => q.id === selected)?.name}</>
                )}
              </div>
            );
          }}
        >
          {!multiple && <MenuItem value={null}>Nenhum</MenuItem>}
          {queueIntegration.map((queueIntegration) => (
            <MenuItem key={queueIntegration.id} value={queueIntegration.id}>
              {queueIntegration.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default QueueIntegrationSelect;
