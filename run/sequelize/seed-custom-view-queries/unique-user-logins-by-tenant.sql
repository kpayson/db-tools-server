Select t.tenantId, Count(Distinct(le.userId)) as cnt
From LoginEvent le inner join Tenant t on t.id = le.tenantId 
Where 
	le.eventType = 'login' and
	le.createdOn between @startDate and @endDate
Group By t.tenantId