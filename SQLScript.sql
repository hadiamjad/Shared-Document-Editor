create database Docs
create table UserData(
	username varchar(35), 
	pass varchar(35),
	email varchar(35) primary key
)
go

create table Document(
	DocID int identity primary key,
	title varchar (50),
	dataTxt varchar(max),
	creator varchar(35),
	socket int
)
go

create Table DocumentEditors(
	DocsID int,
	email varchar(35),
	primary key(DocsId,email),
	Foreign key (DocsID) references Document(DocID),
	Foreign key (email) references UserData(email)
)
go


--------------------------------------------------
Select * from UserData
Select * from Document
Select * from DocumentEditors
--------------------------------------------------
insert into Document values('Welcome','Welcome to Docs','hadi@gmail.com', 3005)
insert into Document values('Welcome 3','Welcome to Docs','haris@gmail.com', 3007)
DROP PROCEDURE retDocs; 
----------------------------------------------------
--insert user--
CREATE PROCEDURE istUser @u varchar(35), @pp varchar(35), @e varchar(35)
AS
insert into UserData values(@u, @pp, @e)

EXEC istUser @u = "Hadi1", @pp = "1234", @e = "hadiyovillee25@gmail.com"
------------------------------------------
--login check--
CREATE PROCEDURE LoginReq @pp varchar(35), @e varchar(35)
AS
select email from UserData where email = @e AND pass = @pp

EXEC LoginReq @pp = "123", @e = "dada@d"
------------------------------------------
--return documents of user--
CREATE PROCEDURE retDocs  @e varchar(35)
AS
select *  from Document where creator = @e

EXEC retDocs @e = "hadi@gmail.com"
------------------------------------------