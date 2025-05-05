import React, { useContext, useState } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, ListItemText } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  menuListItem: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  menuItem: {
    maxHeight: 30,
  },
  listItemText: {
    fontSize: "0.875rem", // Adicionando estilo para o texto, caso necessário
  },
}));

const TicketsQueueSelect = ({
  userQueues,
  selectedQueueIds = [],
  onChange,
}) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  // Estado local para controlar checkboxes visualmente
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedQueueIds);

  // Sincroniza localSelectedIds com selectedQueueIds quando ele mudar
  React.useEffect(() => {
    setLocalSelectedIds(selectedQueueIds);
  }, [selectedQueueIds]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Ignora a seleção de "clear-queues" para onChange
    if (newValue.includes("clear-queues")) {
      // Desmarca todas as filas visualmente, sem chamar onChange
      setLocalSelectedIds([]);
      return;
    }

    // Verifica se há filas específicas (não "no-queue" nem "clear-queues")
    const hasQueueIds = newValue.some((id) => id !== "no-queue" && id !== "clear-queues");

    // Detecta o que foi recém-adicionado
    const addedItems = newValue.filter((id) => !selectedQueueIds.includes(id));

    if (addedItems.includes("no-queue")) {
      // Se "Sem Fila" foi recém-selecionado, define apenas ["no-queue"]
      setLocalSelectedIds(["no-queue"]);
      onChange(["no-queue"]);
    } else if (hasQueueIds && addedItems.length > 0) {
      // Se uma fila específica foi recém-selecionada, remove "no-queue" e mantém as filas
      const filteredValue = newValue.filter((id) => id !== "no-queue" && id !== "clear-queues");
      setLocalSelectedIds(filteredValue);
      onChange(filteredValue);
    } else if (selectedQueueIds.includes("no-queue") && !newValue.includes("no-queue")) {
      // Se "Sem Fila" foi desmarcado, seleciona todas as filas
      const allQueueIds = userQueues?.length > 0 ? userQueues.map((queue) => queue.id) : [];
      setLocalSelectedIds(allQueueIds);
      onChange(allQueueIds);
    } else {
      // Caso contrário, passa o newValue filtrado
      const filteredValue = newValue.filter((id) => id !== "no-queue" && id !== "clear-queues");
      setLocalSelectedIds(filteredValue);
      onChange(filteredValue);
    }
  };

  return (
    <div style={{ width: 120, marginTop: -4 }}>
      <FormControl fullWidth margin="dense">
        <Select
          multiple
          displayEmpty
          variant="outlined"
          value={localSelectedIds}
          onChange={handleChange}
          style={{
            borderRadius: 8,
            height: 30,
          }}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "center",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "center",
            },
            getContentAnchorEl: null,
            PaperProps: {
              style: {
                borderRadius: "0 0 8px 8px",
              },
            },
            MenuListProps: {
              className: classes.menuListItem,
            },
          }}
          renderValue={() => i18n.t("ticketsQueueSelect.placeholder")}
        >
          <MenuItem
            dense
            key="clear-queues"
            value="clear-queues"
            className={classes.menuItem}
          >
            <Checkbox
              style={{
                color: "#000",
              }}
              size="small"
              color="primary"
              checked={localSelectedIds.length === 0}
            />
            <ListItemText
              primary="Limpar Filas"
              classes={{ primary: classes.listItemText }}
            />
          </MenuItem>
          {userQueues?.length > 0 &&
            userQueues.map((queue) => (
              <MenuItem
                dense
                key={queue.id}
                value={queue.id}
                className={classes.menuItem}
              >
                <Checkbox
                  style={{
                    color: queue.color,
                  }}
                  size="small"
                  color="primary"
                  checked={localSelectedIds.indexOf(queue.id) > -1}
                />
                <ListItemText
                  primary={queue.name}
                  classes={{ primary: classes.listItemText }}
                />
              </MenuItem>
            ))}
          {user.allTicket === "enable" && (
            <MenuItem
              dense
              key="no-queue"
              value="no-queue"
              className={classes.menuItem}
            >
              <Checkbox
                style={{
                  color: "#000", // Defina a cor desejada para "Sem Fila"
                }}
                size="small"
                color="primary"
                checked={localSelectedIds.indexOf("no-queue") > -1}
              />
              <ListItemText
                primary="Sem Fila"
                classes={{ primary: classes.listItemText }}
              />
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsQueueSelect;