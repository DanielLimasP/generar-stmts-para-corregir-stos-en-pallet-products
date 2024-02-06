const { cloneDeep } = require("lodash");
const json2xls = require("json2xls");
const mysql = require("mysql");
const fs = require("fs");

writeSqlStatementsToPatchPalletProducts = () => {
  const palletProductsForPatch = require("./data/json/palletProductsForPatch.json");
  const patchedPalletProducts = [];
  const noDataForPatchElements = [];
  let queries = "";
  const palletProductsToPatch = detectXmlDataSTOInconsistencies();
  for (const palletProduct of palletProductsToPatch) {
    const { sapNumber, shipment, store } = palletProduct;
    const xmlData = JSON.parse(palletProduct.xmlData);
    const dataForPatch = palletProductsForPatch.find((element) => {
      let flag = false;
      const {
        id_fol_emb,
        id_num_un,
        id_fol_ped,
        id_num_sku,
        id_fol_esmcia,
        Num_PosSTO_correcto,
      } = element;
      for (const e of xmlData) {
        const { Id_Fol_Ped, Id_Fol_Trsf, Num_Posicion } = e;
        if (
          String(id_fol_emb) === shipment &&
          String(id_num_un) === store &&
          String(id_num_sku) === sapNumber &&
          String(id_fol_ped) === Id_Fol_Ped &&
          String(id_fol_esmcia) === Id_Fol_Trsf &&
          String(Num_PosSTO_correcto) === Num_Posicion
        ) {
          flag = true;
        }
      }
      return flag;
    });
    if (dataForPatch) {
      const { id_fol_esmcia, id_num_sku, id_fol_ped, Num_PosSTO_correcto } =
        dataForPatch;
      const xmlDataToPatch = cloneDeep(xmlData);
      for (const element of xmlDataToPatch) {
        const { Id_Fol_Ped, Id_Fol_Trsf, Num_Posicion, Num_MaterialSAP } =
          element;
        if (
          Id_Fol_Ped === String(id_fol_ped) &&
          Id_Fol_Trsf === String(id_fol_esmcia) &&
          Num_Posicion === String(Num_PosSTO_correcto) &&
          Num_MaterialSAP === String(id_num_sku)
        ) {
          element.Num_OrdenCompra = String(dataForPatch.Num_STO);
          element.Num_Posicion = String(dataForPatch.Num_PosSTO_correcto);
        }
      }
      const query = mysql.format(
        `
        UPDATE palletsproducts SET xmlData = ? WHERE id = ?;
        `,
        [JSON.stringify(xmlDataToPatch), palletProduct.id]
      );
      queries += query;
      patchedPalletProducts.push({
        id: palletProduct.id,
        ...dataForPatch,
      });
      const msg = `Writing stmt to UPDATE palletProduct ${store}-${shipment}-${sapNumber}`;
      console.log(msg);
    } else {
      noDataForPatchElements.push(palletProduct);
    }
  }
  fs.writeFileSync("./data/generated/updatePalletProductStatements.sql", queries);
  writeXlsxReport("noDataForPatchElements", noDataForPatchElements);
  writeXlsxReport("patchedPalletProducts", patchedPalletProducts);
};

const detectXmlDataSTOInconsistencies = () => {
  const palletProducts = require("./data/json/palletProducts.json");
  const palletProductsToPatch = [];
  for (const palletProduct of palletProducts) {
    let flag = false;
    const xmlData = JSON.parse(palletProduct.xmlData);
    for (const element of xmlData) {
      const { Num_OrdenCompra } = element;
      if (Num_OrdenCompra && Num_OrdenCompra.indexOf(" ") > 0) {
        flag = true;
      }
    }
    if (flag) {
      palletProductsToPatch.push(palletProduct);
    }
  }
  console.log(
    `Found ${palletProductsToPatch.length} pallet products STO inconsistencies.`
  );
  return palletProductsToPatch;
};

const writeXlsxReport = (filename, data) => {
  const xlsxData = json2xls(data);
  fs.writeFileSync(`./data/reports/${filename}.xlsx`, xlsxData, "binary");
};

writeSqlStatementsToPatchPalletProducts();
