import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import { Button, IconButton, StepContent, TextField, MenuItem } from "@material-ui/core";
import { Field } from "formik";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import SaveIcon from "@material-ui/icons/Save";
import EditIcon from "@material-ui/icons/Edit";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import Select from "@material-ui/core/Select";
import useUsers from "../../hooks/useUsers";
import useAuth from "../../hooks/useAuth.js";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    //height: 400,
    [theme.breakpoints.down("sm")]: {
      maxHeight: "20vh",
    },
  },
  button: {
    marginRight: theme.spacing(1),
  },
  input: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  addButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export function RotationOptions({ rotationId, setRotationUser, setSavedOptions, queueId }) {
  const { users } = useUsers(999999);
  const classes = useStyles();
  const [options, setOptions] = useState([]);
  const [paramsRotationUsers, setParamsRotationUsers] = useState([]);
  const [user, setUser] = useState([]);

  const [redefineRotationId, setRedefineRotationId] = useState(null);

  const userConnected = useAuth();

  // const [roule, setOptions] = useState([]);

  useEffect(() => {
    if (rotationId) {
      const fetchOptions = async () => {
        try {
          let optionsList = []
          const { data } = await api.get(`/rotations?rotationId=${rotationId}`);

          const rotationUsers = await api.get(`/rotationUsers`, {
            params: {
              rotationId
            }
          });

          for (let i=0; i < rotationUsers.data.rotationUsers.length; i++) {
            const options = {
              userId: 1
            }
            const user = await handleGetUser(rotationUsers.data.rotationUsers[i])

            optionsList.push({
              ...data.rotations[0],
              userId: user.id,
              user: user.name,
              sequence: 1,
              edition: false,
              option: options.length + 1,
              rotationId,
              parentId: null,
              children: [],
            })
          }

          setOptions(optionsList);
          setParamsRotationUsers(rotationUsers.data.rotationUsers);
        } catch (e) {
          toastError(e);
        }
      };
      fetchOptions();
    }
  }, []);

  useEffect(() => {
    setUser(users)
  }, [users]);

  const renderStepper = () => {
    if (options.length > 0) {
      return (
        <RotationOptionStepper
          rotationId={rotationId}
          updateOptions={updateOptions}
          options={options}
          users={user}
          setRotationUser={setRotationUser}
          setSavedOptions={setSavedOptions}
          setRedefineRotationId={setRedefineRotationId}
          redefineRotationId={redefineRotationId}
          queueId={queueId}
          paramsRotationUsers={paramsRotationUsers}
        />
      );
    }
  };

  const updateOptions = () => {
    setOptions([...options]);
  };

  const addOption = () => {
    const validOptions = options.find((value) => {
      return value.user.length === 0
    })

    if (validOptions) return toast(`${i18n.t("queueModal.rotation.rotationOptions.toasts.warningOption")}`)
    const newOption = {
      user: "",
      userId: "",
      sequence: "",
      edition: false,
      option: options.length + 1,
      rotationId,
      parentId: null,
      children: [],
    };
    setOptions([...options, newOption]);
  };

  return (
    <div className={classes.root}>
      <br />
      <Typography>
        Usuário
        <Button
          color="primary"
          size="small"
          onClick={addOption}
          startIcon={<AddIcon />}
          style={{ marginLeft: 10 }}
          variant="outlined"
        >
          Adicionar
        </Button>
      </Typography>
      {renderStepper()}
    </div>
  );
}

export const handleGetUser = async (option) => {
  if (!option.userId) return
  const userId = Number(option.userId)
  const { data } = await api.request({
    url: `/users/${userId}`,
    method: "GET",
    params: { userId },
  });
  return data
}

export function RotationOptionStepper({ 
  rotationId, 
  options, 
  updateOptions, 
  users, 
  setRotationUser, 
  setSavedOptions,
  queueId,
  setRedefineRotationId,
  redefineRotationId,
  paramsRotationUsers
}) {
  const classes = useStyles();
  const [activeOption, setActiveOption] = useState(-1);
  const handleOption = (index) => async () => {
    setActiveOption(index);
    const option = options[index];
    if (option !== undefined && option.id !== undefined) {
      try {
        const { data } = await api.request({
          url: "/rotations",
          method: "GET",
          params: { rotationId, parentId: option.id },
        });

        const options = {
          userId: 1
        }
        const user = await handleGetUser(options)

        /* optionsList.push({
          ...data.rotations[0],
          userId: user.id,
          user: user.name,
          sequence: 1,
          edition: false,
          option: options.length + 1,
          rotationId,
          parentId: null,
          children: [],
        }) */

        const optionList = data.rotations.map((option) => {
          return {
            ...option,
            userId: user.id,
            user: user.name,
            sequence: 1,
            edition: false,
            option: options.length + 1,
            rotationId,
            parentId: null,
            children: [],
          };
        });
        option.children = optionList;
        updateOptions();
      } catch (e) {
        toastError(e);
      }
    }
  };

  const handleSave = async (option) => {
    try {
      if (!option.userId || !option.sequence) toast(`${i18n.t("queueModal.rotation.rotationOptions.toasts.warning")}`);
      if (option.id && option.updatedAt) {

        option.userId = Number(option.userId)
        option.sequence = Number(option.sequence)

        await api.put(`/rotations/${option.id}`, { option });

        const user = await handleGetUser(option)
        option.user = user.name
      } else {

        option.queueId = queueId;
        const user = await handleGetUser(option)
        option.user = user.name
        /* if (!rotationId) {
          console.log('entrou no if do else')
          setRotationUser({
            userId: Number(option.userId),
            sequence: Number(option.sequence)
          })
        } else { */

          const {data} = await api.post("/rotations", { ...option });

          setRedefineRotationId(data.id);
        //}
        //const user = await handleGetUser(option)
        //option.user = user.name
      }

      option.edition = false;
      setSavedOptions(true)
      updateOptions();
    } catch (e) {
      const errorMsg = e.response?.data?.error;
      toastError(i18n.t(`backendErrors.${errorMsg}`));
    }
  };

  const handleEdition = (index) => {
    setSavedOptions(false)
    options[index].edition = !options[index].edition;
    options[index].rotationId = redefineRotationId ?? rotationId;
    updateOptions();
  };

  const handleDeleteOption = async (index) => {
//paramsRotationUsers
    const option = options[index];
    const deleteRotationUserId = paramsRotationUsers.filter(e => e.userId === option.userId).map(e => e.id)

    if (option !== undefined && option.id !== undefined) {
      try {
        await api.request({
          url: `/rotationUsers/${deleteRotationUserId}`,
          method: "DELETE",
        });
      } catch (e) {
        toastError(e);
      }
    }
    options.splice(index, 1);
    options.forEach(async (option, order) => {
      option.option = order + 1;
      //await handleSave(option);
    });
    updateOptions();
  };

  const handleOptionChangeUserId = (event, index) => {
    options[index].userId = event.target.value;
    updateOptions();
  };

  const handleOptionChangeSequence = (event, index) => {
    options[index].sequence = event.target.value;
    updateOptions();
  };

  const renderUserId = (index) => {

    const option = options[index];
    if (option.edition) {
      return (
        <>
          <Select
            style={{width: '70%'}}
            value={option.userId}
            onChange={(event) => handleOptionChangeUserId(event, index)}
          >
            { users.map((user, index) => {
              return <MenuItem value={user.id} key={index}>{ user.name }</MenuItem>
            })}
          </Select>
          {option.edition && (
            <>
              <IconButton
                color="primary"
                variant="outlined"
                size="small"
                className={classes.button}
                onClick={() => {
                  handleSave(option)
                }}
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                variant="outlined"
                color="secondary"
                size="small"
                className={classes.button}
                onClick={() => handleDeleteOption(index)}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </>
          )}
        </>
      );
    }
    return (
      <>
        <Typography>
          {option.userId !== "" ? option.user : "Adicione um usuário"}
          <IconButton
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={() => handleEdition(index)}
          >
            <EditIcon />
          </IconButton>
        </Typography>
      </>
    );
  };

  const renderSequence = (index) => {
    const option = options[index];
    if (option.edition) {
      return (
        <>
          <Field
            as={TextField}
            type="number"
            style={{ width: "90%" }}
            // multiline
            value={option.sequence}
            onChange={(event) => handleOptionChangeSequence(event, index)}
            size="small"
            className={classes.input}
            placeholder="Sequência"
          />
        </>
      );
    }
    // return (
    //   <>
    //     <Typography onClick={() => handleEdition(index)}>
    //       {'teste'}
    //     </Typography>
    //   </>
    // );
  };

  const handleAddOption = (index) => {
    
    const optionNumber = options[index].children.length + 1;
    options[index].children.push({
      user: "",
      userId: "",
      sequence: "",
      edition: false,
      option: optionNumber,
      rotationId,
      parentId: options[index].id,
      children: [],
    });
    updateOptions();
  };

  const renderStep = (option, index) => {

    return (
      <Step key={index}>
        <StepLabel style={{ cursor: "pointer" }} onClick={handleOption(index)}>
          {renderUserId(index)}
        </StepLabel>
        <StepContent>
          {renderSequence(index)}

          {/* {option.id !== undefined && (
            <>
              <Button
                color="primary"
                size="small"
                onClick={() => handleAddOption(index)}
                startIcon={<AddIcon />}
                variant="outlined"
                className={classes.addButton}
              >
                Adicionar
              </Button>
            </>
          )}
          <RouletteOptionStepper
            rotationId={rotationId}
            options={option.children}
            updateOptions={updateOptions}
            setRouletteUser={setRouletteUser}
          /> */}
        </StepContent>
      </Step>
    );
  };

  const renderStepper = () => {
    return (
      <Stepper
        style={{ marginBottom: 0, paddingBottom: 0 }}
        nonLinear
        activeStep={activeOption}
        orientation="vertical"
      >
        {options.map((option, index) => renderStep(option, index))}
      </Stepper>
    );
  };

  return renderStepper();
}
