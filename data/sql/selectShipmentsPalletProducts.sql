select
    palletsproducts.id, 
    pallets.id as 'palletId', 
    productsquantities.id as 'productQuantityId', 
    productsquantities.sapNumber as 'sapNumber', 
    shipments.number as 'shipment', 
    locations.externalId as 'store', 
    palletsproducts.quantitySent as 'quantitySent', 
    palletsproducts.xmlData as 'xmlData', 
    palletsproducts.createdAt as 'createdAt', 
    palletsproducts.updatedAt as 'updatedAt', 
    palletsproducts.deletedAt as 'deletedAt'
from 
    palletsproducts
        left join productsquantities
            on productsquantities.id = palletsproducts.productQuantityId
        left join pallets
            on palletsproducts.palletId = pallets.id
        left join locations
            on pallets.originalLocationId = locations.id
        left join shipments
            on pallets.shipmentId = shipments.id
where shipments.id in ();
            