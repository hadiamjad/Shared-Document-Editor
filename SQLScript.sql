create database Docs
create table UserData(
	username varchar(35), 
	pass varchar(35),
	email varchar(35) primary key
)
go

-- Create a sequence
CREATE SEQUENCE SORT_ID_seq
    START WITH 5000
    INCREMENT BY 1 ;
GO

create table Document(
	DocID int identity primary key,
	title varchar (50),
	dataTxt varchar(max),
	creator varchar(35),
	socket int DEFAULT (NEXT VALUE FOR SORT_ID_seq)
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
insert into Document values('Welcome','Welcome to Docs','Hadiyoville25@gmail.com',default)
insert into Document values('Welcome 2','Welcome to Docs','hadi@gmail.com', default)
UPDATE Document SET dataTxt = 'hello' where DocID=3
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

EXEC retDocs @e = " Hadiyoville25@gmail.com"
------------------------------------------
--delete documents of user with docID--
CREATE PROCEDURE delDocs  @ID int
AS
delete  from Document where Document.DocID = @ID

EXEC delDocs @ID = 1
-------------------------------------------
--insert new Document--
CREATE PROCEDURE istDocs  @e varchar(35)
AS
insert into Document values('Untitled','',@e,default)

EXEC istDocs @e = "hadi@gmail.com"
-----------------------------------------
-- get doc details--
CREATE PROCEDURE getDocs  @ID int
AS
select *  from Document where Document.DocID = @ID

------------------------------------

