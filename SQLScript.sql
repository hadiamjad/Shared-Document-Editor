create table UserData(
	username varchar(15) primary key,
	pass varchar(15),
	email varchar(15)
)
go

create table DataText(
	DocID int primary key,
	dataTxt varchar(max),
	creatorUN varchar(15)
)
go

create table Collab(
	creatorUN varchar(15),
	collabUN varchar(15),
	primary key(creatorUN,collabUN)
)
go

--------------------------------------------------
Select * from UserData
Select * from DataText
Select * from Collab
----------------------------------------------------
CREATE PROCEDURE istUser @u varchar(15), @pp varchar(15), @e varchar(15)
AS
insert into UserData values(@u, @pp, @e)

EXEC istUser @u = "Hadi", @pp = "123", @e = "h@gmail.com";
------------------------------------------
CREATE PROCEDURE LoginReq @pp varchar(15), @e varchar(15)
AS
select email from UserData where email = @e AND pass = @pp