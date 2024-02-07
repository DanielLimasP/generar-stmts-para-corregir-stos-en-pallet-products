select 
	a.id,
	a.name as "shipment",
	b.externalId as "externalId",
	c.externalId as "cedis",
	d.externalId as "location",
	b.day,
	b.arrivedAt,
	b.offloadingAt,
	b.readyToLeaveAt,
	b.leftAt,
	b.finishedAt,
	b.sapTransferMovements
from 
	shipments as a
	left join shipmentslocations as b
		on b.shipmentId = a.id
	left join locations as c
		on b.locationFromId = c.id
	left join locations as d
		on b.locationToId = d.id
where
	b.arrivedAt is not null and 
	b.offloadingAt is null and 
	b.finishedAt is null and 
	b.sapTransferMovements is not null and 
	b.readyToLeaveAt is null and
	b.deletedAt is null and 
	b.createdAt > DATE_SUB(NOW(), INTERVAL 60 DAY) 
		and (b.sapTransferMovements like "%Para el pedido%" or b.sapTransferMovements like "%Los datos del doc%") 	
order by arrivedAt desc;