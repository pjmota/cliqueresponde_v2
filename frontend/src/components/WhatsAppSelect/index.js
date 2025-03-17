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

const WhatsAppSelect = ({
  hasRoulette,
  selectedWhatsappIds,
  onChange,
  multiple = true,
  title = i18n.t("WhatsApps"),
  noColor = false,
  style,
}) => {
  const classes = useStyles();
  const [whatsapps, setWhatsapps] = useState([]);

  useEffect(() => {
    fetchWhatsapps();
  }, []);

  const fetchWhatsapps = async () => {
    try {
      const { data } = await api.get("/whatsapp", { params: { hasRoulette } });
      setWhatsapps(data);
    } catch (err) {
      toastError(err);
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ style }}>
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel shrink={multiple ? !!selectedWhatsappIds?.length : !!selectedWhatsappIds}>{title}</InputLabel>
        <Select
          label={title}
          multiple={multiple}
          labelWidth={60}
          value={selectedWhatsappIds}
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
                    const whatsapp = whatsapps.find((q) => q.id === id);
                    return whatsapp ? (
                      <Chip
                        key={id}
                        style={{ backgroundColor: whatsapp.color }}
                        variant="outlined"
                        label={whatsapp.name}
                        className={classes.chip}
                      />
                    ) : null;
                  })
                ) : selected?.toString().length > 0 && !multiple && !noColor ? (
                  <Chip
                    key={selected}
                    variant="outlined"
                    style={{
                      backgroundColor: whatsapps.find((q) => q.id === selected)
                        ?.color,
                    }}
                    label={whatsapps.find((q) => q.id === selected)?.name}
                    className={classes.chip}
                  />
                ) : (
                  <>{whatsapps.find((q) => q.id === selected)?.name}</>
                )}
              </div>
            );
          }}
        >
          {!multiple && <MenuItem value={null}>Nenhum</MenuItem>}
          {whatsapps.map((whatsapp) => (
            <MenuItem key={whatsapp.id} value={whatsapp.id}>
              {whatsapp.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default WhatsAppSelect;
