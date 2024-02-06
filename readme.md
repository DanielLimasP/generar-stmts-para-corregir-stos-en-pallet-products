# Script para generar parche de STO incorrecta

## Consideraciones

- Este script se utiliza para detectar registros de `palletproducts` chuecos y generar statements que modifiquen el valor del `STO`.
- Es necesario validar la instalación de `nodejs` para poder ejectuarlo. En cualquier terminal podemos ejectuar el siguiente comando para validar si `nodejs` está correctamente instalado. `node -v`. El resultado debería ser que veamos la versión de `nodejs` que está instalada en nuestro ordenador.
- Es necesario instalar un par de dependencias de `npm` para poder ejecutar el script. Para instalar dichas dependencias, podemos ejectuar el siguiente comando en la terminal adjunta del editor de código: `npm install`. Una vez terminen de instalarse las dependencias, ya deberíamos poder ejecutar el script.
- La ejecución del script genera un par de reportes:
    - `noDataForPatchElements.xlsx`: Nos indica para cuales registros chuecos o malformados de `palletsproducts` no existe una contraparte de solución en el universo de datos compartidos por cedis.
    - `palletProductsToPatch.xlsx`: Nos indica, luego de haber ejecutado el script, los registros de `palletsproducts` que serán modificados.
 
## Cómo ejecutar el script

1. Identificar los embarques que tienen el problema de 'No se puede efectuar una EM para $pedido$ $posición$' con el `query` `selectShipmentsWithProblems.sql`. 
2. Obtener los `shipmentIds` correspondientes a los embarques que cuentan con problemas. Es necesario crear una lista de `shipmentIds` separados por comas, de manera que puedan alimentar al `query` del siguiente paso.
3. Obtener los registros de `palletsproducts` utilizando los `shipmentIds` obtenidos en el paso anterior. Para esto, hay que alimentar al `query` de `selectShipmentsPalletProducts.sql` con los `shipmentIds` obtenidos anteriormente.
4. Exportar los registros de `palletsproducts` obtenidos a un archivo de formato `JSON` llamado `palletProducts.json`.
5. Mover el archivo obtenido en el paso anterior al directorio de `./data/json/`. El directorio anterior se debe de encontrar dentro del repositorio. Sobreescribir el archivo anterior en caso de que lo solicite.
6. Ejecutar la instrucción de `node .` en la terminal adjunta del editor de código.
7. Copiar y pegar las instrucciones generadas en el archivo `palletProductsPatchStatements.sql`, en el cliente de base de datos con conexión a productivo.
8. Validar que los `update statements` generados realizan la operación deseada.
9. Ejecutar los `update statements`. 