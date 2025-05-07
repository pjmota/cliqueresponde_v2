import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
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

const AfterSalesStatusSelect = ({ selectedAfterSalesStatusIds, onChange, multiple = true, title = i18n.t("Status"), noColor = false, disabled = false, showAllOption = true }) => {
	const classes = useStyles();
	const [status, setStatus] = useState([]);

	const [statusId, setStatusId] = useState(multiple ? [] : '');

	useEffect(() => {
		setStatusId(selectedAfterSalesStatusIds);
	}, [selectedAfterSalesStatusIds]);

	useEffect(() => {
		const data = [
			{
				name: 'Pós-Venda Pendente',
				id: 'POS_VENDA_PENDENTE'
			},
			{
				name: 'Alterar Adesão',
				id: 'ALTERAR_ADESAO'
			},
			{
				name: 'Alterar Endereço',
				id: 'ALTERAR_ENDERECO'
			},
			{
				name: 'Alterar Informações do Cliente',
				id: 'ALTERAR_INFORMACOES_CLIENTE'
			},
			{
				name: 'Alterar Observação',
				id: 'ALTERAR_OBSERVACAO'
			},
			{
				name: 'Cancelar',
				id: 'CANCELAR'
			},
			{
				name: 'Direcionar Para Vendedor',
				id: 'DIRECINAR_PARA_VENDEDOR'
			},
			{
				name: 'Documento Pendente',
				id: 'DOCUMENTO_PENDENTE'
			},
			{
				name: 'Forma de Pagamento Inválida',
				id: 'FORMA_PAGAMENTO_INVALIDA'
			},
			{
				name: 'Fotos Ilegíveis',
				id: 'FOTOS_ILEGIVEIS'
			},
			{
				name: 'Finalizou Venda',
				id: 'FINALIZOU_VENDA'
			},
			{
				name: 'Receber Mensalidade',
				id: 'RECEBER_MENSALIDADE'
			},
			{
				name: 'Transação Negada',
				id: 'TRANSACAO_NEGADA'
			},
			{
				name: 'Caixa Postal',
				id: 'CAIXA_POSTAL'
			},
			{
				name: 'Pós-Venda Concluído',
				id: 'POS_VENDA_CONCLUIDO'
			}
		].sort((a, b) => a.id > b.id ? 1 : -1);


		if (showAllOption) {
			data.unshift({
				name: 'Todos',
				id: 'TODOS'
			});
		}

        setStatus(data);
	}, []);

	const handleChange = e => {
		const value = e.target.value;

		// if (multiple && value?.some(item => (item === 'TODOS'))) {
		// 	onChange(['TODOS']);
		// 	setStatusId(['TODOS']);
		// 	return;
		// }

		// if (!multiple && value === 'TODOS') {
		// 	onChange(value);
		// 	setStatusId(value);
		// 	return;
		// }

		onChange(e.target.value);
		setStatusId(e.target.value);
	};

	return (
		<div>
			<FormControl style={{width: '200px'}}  >
				<InputLabel shrink={!!statusId?.length} >{title}</InputLabel>
				<Select
					style={{width: '200px'}}
					label={title}
					multiple={multiple}
					labelWidth={60}
					value={statusId}
					disabled={disabled}
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
										const queue = status.find(q => q.id === id);
										return queue ? (
											<Chip
												key={id}
												style={{ backgroundColor: queue.color }}
												variant="outlined"
												label={queue.name}
												className={classes.chip}
											/>
										) : null;
									})

								) : selected?.toString().length > 0 && !multiple && !noColor ?
									(
										<Chip
											key={selected}
											variant="outlined"
											style={{ backgroundColor: status.find(q => q.id === selected)?.color }}
											label={status.find(q => q.id === selected)?.name}
											className={classes.chip}
										/>
									) : (
										<>
										{ status.find(q => q.id === selected)?.name }
										</>
									)
								}

							</div>
						)
					}}
				>
					{!multiple && <MenuItem value={null}>Nenhum</MenuItem>}
					{status.map(queue => (
						<MenuItem key={queue.id} value={queue.id}>
							{queue.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default AfterSalesStatusSelect;
