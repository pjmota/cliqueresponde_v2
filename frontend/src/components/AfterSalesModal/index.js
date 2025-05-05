import React, { useState, useEffect, useRef, useContext } from "react";

import * as Yup from "yup";
import {
  Formik,
  FieldArray,
  Form,
  Field,
  useFormik,
  FormikProvider,
} from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import InsertPhotoIcon from "@material-ui/icons/InsertPhoto";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { MenuItem, Select } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  number: Yup.string().min(8, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email"),
});

const AfterSalesModal = ({ open, onClose, afterSaleId, initialValues }) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(AuthContext);

  const initialState = {
    contact: {
      id: "",
      name: "",
      number: "",
      email: "",
    },
    details:
      user.contactCustomFields
        ?.split(";")
        .map((name) => ({ name, value: "" })) ?? [],
  };

  const [aftersales, setAfterSales] = useState(initialState);

  const formik = useFormik({
    initialValues: aftersales,
    enableReinitialize: true,
    validationSchema: ContactSchema,
    onSubmit: (values, actions) => {
      setTimeout(() => {
        handleSaveContact(values);
        actions.setSubmitting(false);
      }, 400);
    },
  });

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchAfterSales = async () => {
      if (initialValues) {
        setAfterSales((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!afterSaleId) return;

      try {
        const { data } = await api.get(`/aftersales/${afterSaleId}`);
        if (isMounted.current) {
          setAfterSales(data);
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchAfterSales();
  }, [afterSaleId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setAfterSales(initialState);
  };

  const handleImage = (file, index) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const details = [...formik.values.details];
      details[index].value = file.name;
      details[index].image = reader.result;
      details[index].mediaPath = undefined;

      formik.setValues({ ...formik.values, details });
    };

    reader.readAsDataURL(file);
  };

  const handleSaveContact = async () => {
    setIsSubmitting(true);
    try {
      if (formik.values.id) {
        await api.put(`/aftersales/${formik.values.id}`, { ...formik.values });
      } else {
        await api.post(`/aftersales`, { ...formik.values });
      }

      formik.resetForm();
      handleClose();
      toast.success(i18n.t("Pós-venda registrado/atualizado com sucesso."));
    } catch (err) {
      toastError(err);
    }
    setIsSubmitting(false);
  };

  const isImage = (value) => {
    return value.toLocaleLowerCase().trim().startsWith("img");
  };

  const isSelect = (value) => {
    return value.match(/CMB\s{1,}(.*)\[(.*)\]/i);
  };

  const cmbOptions = (value) => {
    const m = value.match(/CMB\s{1,}(.*)\[(.*)\]/i);
    return m[2].split("|");
  };

  const cmbLabel = (value) => {
    const m = value.match(/CMB\s{1,}(.*)\[(.*)\]/i);
    return m[1];
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {afterSaleId
            ? `${i18n.t("Editar pós-venda")}`
            : `${i18n.t("Adicionar pós-venda")}`}
        </DialogTitle>
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent dividers>
              <Typography variant="subtitle1" gutterBottom>
                {i18n.t("contactModal.form.mainInfo")}
              </Typography>
              <TextField
                label={i18n.t("contactModal.form.name")}
                name="contact.name"
                autoFocus
                variant="outlined"
                margin="dense"
                value={formik.values.contact.name}
                onChange={formik.handleChange}
                className={classes.textField}
              />
              <TextField
                label={i18n.t("contactModal.form.number")}
                name="contact.number"
                placeholder="5541998608485"
                variant="outlined"
                margin="dense"
                value={formik.values.contact.number}
                onChange={formik.handleChange}
              />
              <div>
                <TextField
                  label={i18n.t("contactModal.form.email")}
                  name="contact.email"
                  placeholder="Email address"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  value={formik.values.contact.email}
                  onChange={formik.handleChange}
                />
              </div>
              <Typography
                style={{ marginBottom: 8, marginTop: 12 }}
                variant="subtitle1"
              >
                {i18n.t("contactModal.form.whatsapp")}{" "}
                {/* {contact?.whatsapp ? contact?.whatsapp.name : ""} */}
              </Typography>
              <Typography
                style={{ marginBottom: 8, marginTop: 12 }}
                variant="subtitle1"
              >
                {i18n.t("contactModal.form.extraInfo")}
              </Typography>
              <FieldArray name="details">
                {({ remove, push }) => (
                  <>
                    {formik.values.details &&
                      formik.values.details.length > 0 &&
                      formik.values.details.map((info, index) => (
                        <div
                          className={classes.extraAttr}
                          key={`${index}-info`}
                        >
                          {!isSelect(formik.values.details[index].name) && (
                            <TextField
                              label={i18n.t("contactModal.form.extraName")}
                              name={`details[${index}].name`}
                              variant="outlined"
                              margin="dense"
                              className={classes.textField}
                              value={formik.values.details[index].name}
                              onChange={formik.handleChange}
                            />
                          )}

                          {isSelect(formik.values.details[index].name) && (
                            <TextField
                              label={i18n.t("contactModal.form.extraName")}
                              name={`details[${index}].name`}
                              variant="outlined"
                              margin="dense"
                              disabled={true}
                              className={classes.textField}
                              value={cmbLabel(
                                formik.values.details[index].name
                              )}
                              onChange={formik.handleChange}
                            />
                          )}

                          {!isImage(formik.values.details[index].name) &&
                            isSelect(formik.values.details[index].name) && (
                              <Select
                                label={i18n.t("contactModal.form.extraValue")}
                                name={`details[${index}].value`}
                                variant="outlined"
                                margin="dense"
                                className={classes.textField}
                                value={formik.values.details[index].value}
                                onChange={formik.handleChange}
                              >
                                {cmbOptions(
                                  formik.values.details[index].name
                                ).map((item, index) => (
                                  <MenuItem key={index} value={item}>
                                    {item}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}

                          {!isImage(formik.values.details[index].name) &&
                            !isSelect(formik.values.details[index].name) && (
                              <TextField
                                label={i18n.t("contactModal.form.extraValue")}
                                name={`details[${index}].value`}
                                variant="outlined"
                                margin="dense"
                                className={classes.textField}
                                value={formik.values.details[index].value}
                                onChange={formik.handleChange}
                              />
                            )}

                          {isImage(formik.values.details[index].name) &&
                            formik.values.details[index].mediaPath && (
                              <a
                                href={formik.values.details[index].mediaPath}
                                target="_blank"
                              >
                                {formik.values.details[index].value}
                              </a>
                            )}

                          {isImage(formik.values.details[index].name) &&
                            formik.values.details[index].value &&
                            !formik.values.details[index].mediaPath && (
                              <TextField
                                value={formik.values.details[index].value}
                                label="Imagem"
                                variant="outlined"
                                margin="dense"
                                className={classes.textField}
                                disabled
                              />
                            )}

                          {isImage(formik.values.details[index].name) && (
                            <IconButton size="small" component="label">
                              <input
                                type="file"
                                hidden
                                onChange={(ev) =>
                                  handleImage(ev.target.files[0], index)
                                }
                              />
                              <InsertPhotoIcon />
                            </IconButton>
                          )}

                          <IconButton
                            size="small"
                            onClick={() => remove(index)}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </div>
                      ))}
                    <div className={classes.extraAttr}>
                      <Button
                        style={{ flex: 1, marginTop: 8 }}
                        variant="outlined"
                        color="primary"
                        onClick={() => push({ name: "", value: "" })}
                      >
                        {`+ ${i18n.t("contactModal.buttons.addExtraInfo")}`}
                      </Button>
                    </div>
                  </>
                )}
              </FieldArray>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                disabled={formik.isSubmitting}
                variant="outlined"
              >
                {i18n.t("contactModal.buttons.cancel")}
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={formik.isSubmitting}
                variant="contained"
                className={classes.btnWrapper}
                onClick={handleSaveContact}
              >
                {afterSaleId
                  ? `${i18n.t("contactModal.buttons.okEdit")}`
                  : `${i18n.t("contactModal.buttons.okAdd")}`}
                {formik.isSubmitting || isSubmitting && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </DialogActions>
          </form>
        </FormikProvider>
      </Dialog>
    </div>
  );
};

export default AfterSalesModal;