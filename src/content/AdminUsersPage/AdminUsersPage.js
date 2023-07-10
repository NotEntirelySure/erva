import React, {useState, useEffect, useRef} from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  Button,
  Content,
  DataTable,
  DataTableSkeleton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch
} from '@carbon/react';
import {Add, Edit, TrashCan} from '@carbon/react/icons';

export default function AdminUsersPage() {

  const usersHeader = [
    {key:'userId', header:'User ID'},
    {key:'firstName', header:'First Name'},
    {key:'lastName', header:'Last Name'},
    {key:'email', header:'E-mail'},
    {key:'createdAt', header:'Created At'},
    {key:'roleName', header:'Role'},
    {key:'accountTypeName', header:'Account Type'},
    {key:'verified', header:'Verified'},
    {key:'enabled', header:'Enabled'},
    {key:'action', header:'Action'}
  ]

  const userToDelete = useRef({userId:'',name:''});

  const [showDataTable, setShowDataTable] = useState('none');
  const [showTableSkeleton, setShowTableSekeleton] = useState('block');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({heading:'',message:''});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [users, setUsers] = useState([{
    id:'0',
    userId:0,
    firstName:'',
    lastName:'',
    email:'',
    createdAt:'',
    enabled:false,
    verified:false,
    roleId:0,
    roleName:'',
    accountTypeId:0,
    accountTypeName:'',
    action:''
  }]);

  useEffect(() => {GetUsers();},[]);

  async function GetUsers() {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block'); 
    const usersRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/getall`, {mode:'cors'});
    const usersResponse = await usersRequest.json();
    if (usersResponse.code === 200) {
      const users = usersResponse.data.rows.map((user, index) => (
        {
          id:String(index),
          userId:user.users_id,
          firstName:user.users_first_name,
          lastName:user.users_last_name,
          email:user.users_email,
          createdAt:user.users_created_at,
          enabled:user.users_enabled,
          verified:user.users_verified,
          roleId:user.roles_id,
          roleName:user.roles_name,
          accountTypeId:user.at_id,
          accountTypeName:user.at_name,
          action:<>
            <div style={{display:'flex', gap:'0.125rem'}}>
              <Button
                hasIconOnly
                renderIcon={Edit}
                iconDescription='Edit'
                onClick={() => {}}
              />
              <Button
                hasIconOnly
                kind='danger'
                renderIcon={TrashCan}
                iconDescription='Delete'
                onClick={() => {
                  userToDelete.current = {userId:user.users_id,name:`${user.users_first_name} ${user.users_last_name}`};
                  setDeleteModalOpen(true);
                }}
              />
            </div>
          </>
        }
      ));
      setUsers(users);
      setShowDataTable('block');
      setShowTableSekeleton('none');
    };
    if (usersResponse.code !== 200) {
      setErrorInfo({heading:`Error: ${usersResponse.code}`,message:usersResponse.message})
      setErrorModalOpen(true);
    }
  }

  async function DeleteUser() {
    if (deleteModalOpen) setDeleteModalOpen(false);
    const deleteRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/delete`,{
      method:'DELETE',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(userToDelete.current)
    });
    const deleteResponse = await deleteRequest.json();
    userToDelete.current = {userId:'',name:''};
    if (deleteResponse.code === 200) GetUsers();
    if (deleteResponse.code !== 200) {
      setErrorInfo({heading:`Error: ${deleteResponse.code}`,message:deleteResponse.message})
      setErrorModalOpen(true);
    }
  }
  return (
    <>
      <Modal
        id='ErrorModal'
        open={errorModalOpen}
        modalLabel={errorInfo.heading}
        modalHeading={errorInfo.message}
        modalAriaLabel='error modal'
        primaryButtonText='Ok'
        onRequestClose={() => {
          setErrorModalOpen(false);
          setTimeout(() => setErrorInfo({heading:'',message:''}),750)
        }}
        onRequestSubmit={() => {
          setErrorModalOpen(false);
          setTimeout(() => setErrorInfo({heading:'',message:''}),750)
        }}
      />
      <Modal
        id='confirmDelete'
        danger
        size='sm'
        open={deleteModalOpen}
        modalLabel='Confirm Delete'
        modalHeading={`Are you sure you want to delete ${userToDelete.current.name}?`}
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          userToDelete.current = {userId:'',name:''};
          setDeleteModalOpen(false);
        }}
        onRequestSubmit={() => DeleteUser()}
      />
      <AdminHeader activeSideBarItem="users"/>
      <Content className='pageContent'>
        <div style={{display:showDataTable}}> 
            <DataTable rows={users} headers={usersHeader} isSortable>
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
                getToolbarProps,
                onInputChange,
              }) => (
                <TableContainer 
                  title='Users'
                  description='Displays a list of all users registered in the database.'
                >
                  <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                    <TableToolbarContent>
                      <TableToolbarSearch onChange={onInputChange}/>
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map(header => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                        <TableHeader />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(row => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map(cell => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
        </div>
        <div style={{display:showTableSkeleton}}>
          <DataTableSkeleton
            showHeader
            showToolbar
            headers={usersHeader}
          />
        </div>
      </Content>
    </>
  )

}