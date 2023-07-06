import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  Button,
  ComboBox,
  Content,
  DataTable,
  Dropdown,
  FileUploader,
  Form,
  Loading,
  Modal,
  Stack,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  TextInput,
  Tile,
  DataTableSkeleton,
} from '@carbon/react';
import {
  Add,
  Building,
  CloseOutline,
  Edit,
  Image,
  NoImage,
  TrashCan,
  Upload
} from '@carbon/react/icons';

export default function AdminFacilitiesPage() {

  const states = [
    {text:'Alabama', value:'AL'}, {text:'Alaska', value:'AK'}, {text:'Arizona', value:'AZ'},
    {text:'Arkansas', value:'AR'}, {text:'California', value:'CA'}, {text:'Colorado', value:'CO'},
    {text:'Connecticut', value:'CT'}, {text:'Delaware', value:'DE'}, {text:'Florida', value:'FL'},
    {text:'Georgia', value:'GA'}, {text:'Hawaii', value:'HI'}, {text:'Idaho', value:'ID'},
    {text:'Illinois', value:'IL'}, {text:'Indiana', value:'IN'}, {text:'Iowa', value:'IA'},
    {text:'Kansas', value:'KS'}, {text:'Kentucky', value:'KY'}, {text:'Louisiana', value:'LA'},
    {text:'Maine', value:'ME'}, {text:'Maryland', value:'MD'}, {text:'Massachusetts', value:'MA'},
    {text:'Michigan', value:'MI'}, {text:'Minnesota', value:'MN'}, {text:'Mississippi', value:'MS'},
    {text:'Missouri', value:'MO'}, {text:'Montana', value:'MT'}, {text:'Nebraska', value:'NE'},
    {text:'Nevada', value:'NV'}, {text:'New Hampshire', value:'NH'}, {text:'New Jersey', value:'NJ'},
    {text:'New Mexico', value:'NM'}, {text:'New York', value:'NY'}, {text:'North Carolina', value:'NC'},
    {text:'North Dakota', value:'ND'}, {text:'Ohio', value:'OH'}, {text:'Oklahoma', value:'OK'},
    {text:'Oregon', value:'OR'}, {text:'Pennsylvania', value:'PA'}, {text:'Puerto Rico', value:'PR'}, 
    {text:'Rhode Island', value:'RI'}, {text:'South Carolina', value:'SC'}, {text:'South Dakota', value:'SD'},
    {text:'Tennessee', value:'TN'}, {text:'Texas', value:'TX'}, {text:'Utah', value: 'UT' }, 
    {text:'Vermont', value:'VT'}, {text:'Virginia', value:'VA'}, {text:'Washington', value:'WA'},
    {text:'Washington DC', value:'DC'}, {text:'West Virginia', value:'WV'}, {text:'Wisconsin', value:'WI'},
    {text:'Wyoming', value:'WY'}
  ];
  
  const facilitiesTableHeader = [
    {key:'facilityId', header:'Facility ID'},
    {key:'name', header:'Name'},
    {key:'organization', header:'Assigned Organization'},
    {key:'facilityCode', header:'Facility Code'},
    {key:'address', header:'Address'},
    {key:'city', header:'City'},
    {key:'state', header:'State'},
    {key:'zip', header:'Zip Code'},
    {key:'action', header:'Action'}
  ]

  const emptyFacilityData = {
    action:"",
    id:"",
    name:"",
    organization:"",
    facilityCode:"",
    address:"",
    city:"",
    state:"",
    zip:"",
    image:'',
    lat:0,
    long:0
  }

  const facilityToDelete = useRef({id:'',name:''});
  const imageToDelete = useRef({name:''});
  
  const [organizationData, setOrganizationData] = useState([{organizationId:0,name:''}]);
  const [facilityData, setFacilityData] = useState([emptyFacilityData]);
  const [faciliityImage, setFacilityImage] = useState();
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [addEditData, setAddEditData] = useState(emptyFacilityData);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [showDataTable, setShowDataTable] = useState('none');
  const [showTableSkeleton, setShowTableSekeleton] = useState('block');
  const [showRightPane, setShowRightPane] = useState('translateX(35rem)');
  const [showImageTable, setShowImageTable] = useState('none');
  const [showImageTableSkeleton, setShowImageTableSkeleton] = useState('block')
  const [showImage, setShowImage] = useState('block');
  const [showImageLoading, setShowImageLoading] = useState('none');
  const [imageListData, setImageListData] = useState([]);
  const [confirmDeleteImageModalOpen, setConfirmDeleteImageModalOpen] = useState(false);
  const [imagePreviewModalOpen, setImagePreviewModalOpen] = useState(false);
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const [uploadImageData, setUploadImageData] = useState('');
  const [fileUploadStatus, setFileUploadStatus] = useState('edit');
  const [imageUploadButtonDisabled, setImageUploadButtonDisabled] = useState(true);

  useEffect(() => {GetOrganizations()},[]);
  useEffect(() => {GetFacilities();},[organizationData]);

  async function GetOrganizations() {
    const orgRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/offices/getall`,{mode:'cors'});
    const orgResponse = await orgRequest.json();
    const organizations = orgResponse.map(organization => (
      {
        organizationId:organization.offices_id,
        name:organization.offices_name
      }
    ));
    setOrganizationData(organizations);
  }

  async function GetFacilities() {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block'); 
    const facilitiesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/facilities/getall`,{mode:'cors'});
    const facilitiesResponse = await facilitiesRequest.json();
    const facilities = facilitiesResponse.map((facility, index) => (
      {
        id:String(index),
        facilityId:facility.facilities_id,
        name:facility.facilities_name,
        organization:facility.facilities_fk_offices ? organizationData.find(element => element.organizationId === facility.facilities_fk_offices).name:'',
        facilityCode:facility.facilities_code,
        address:facility.facilities_address,
        city:facility.facilities_city,
        state:facility.facilities_state,
        zip:facility.facilities_zip,
        image:facility.facilities_image,
        lat:facility.facilities_lat,
        long:facility.facilities_long,
        action:<>
          <div>
            <Button
              hasIconOnly
              renderIcon={Edit}
              iconDescription='Edit Facility'
              onClick={() => {
                setAddEditData({
                  action:"edit",
                  id:facility.facilities_id,
                  name:facility.facilities_name,
                  organization: facility.facilities_fk_offices ? 
                    organizationData.find(element => element.organizationId === facility.facilities_fk_offices):
                    {organizationId:0,name:''},
                  facilityCode:facility.facilities_code,
                  address:facility.facilities_address,
                  city:facility.facilities_city,
                  state:states.find(element => element.value === facility.facilities_state),
                  zip:facility.facilities_zip,
                  image:facility.facilities_image,
                  lat:facility.facilities_lat,
                  long:facility.facilities_long
                })
                setShowRightPane('translateX(0rem)');
                GetImage(facility.facilities_image);
              }}
            />
            <Button
              hasIconOnly
              kind='danger'
              renderIcon={TrashCan}
              iconDescription={`Delete Facility`}
              onClick={() => {
                facilityToDelete.current = {id:facility.facilities_id, name:facility.facilities_name};
                setConfirmDeleteModalOpen(true);
              }}
            />
          </div>
        </>
     }
    ))
    setFacilityData(facilities);
    setShowTableSekeleton('none');
    setShowDataTable('block');
  }

  async function AddEditFacility() {
    console.log(showRightPane);

    if (addEditModalOpen) setAddEditModalOpen(false);
    if (showRightPane === 'translateX(0rem)') setShowRightPane('translateX(35rem)');
    const addRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/facilities/${addEditData.action}`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(addEditData)
    })
    const addResponse = await addRequest.json();
    setAddEditData(emptyFacilityData);
    if (addResponse.code === 200) GetFacilities();
  }

  async function DeleteFacility() {
    setConfirmDeleteModalOpen(false);
    const deleteRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/facilities/delete`, {
      method:'DELETE',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(facilityToDelete.current)
    })
    const deleteResponse = await deleteRequest.json();
    if (deleteResponse.code === 200) GetFacilities();
  } 

  async function GetImage(imageName) {
    if (showImage === 'block') setShowImage('none');
    if (showImageLoading === 'none') setShowImageLoading('block');
    const imageRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/facilities/getimage/${imageName ? imageName:'default.jpg'}`,{mode:'cors'});
    const imageResponse = await imageRequest.json();
    setFacilityImage(imageResponse.imageData);
    setShowImageLoading('none');
    setShowImage('block');
  }

  async function GetImageList() {
    if (showImageTable === 'block') setShowImageTable('none');
    if (showImageTableSkeleton) setShowImageTableSkeleton('block');
    const listRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/facilities/getimagelist`,{mode:'cors'});
    const listResponse = await listRequest.json();
    const imageList = listResponse.map((item, index) => (
      {
        id:String(index),
        name:item.fileName,
        createdAt:item.createdAt,
        size:`${Math.round(((item.size)/1024 * 100))/100} ${(item.size)/1024 <= 1024 ? "KB":"MB"}`,
        action:<>
          <div style={{display:'flex', gap:'0.125rem'}}> 
            <Button 
              hasIconOnly
              iconDescription='View Image'
              renderIcon={Image}
              onClick={() => {
                setImagePreviewModalOpen(true);
                GetImage(item.fileName);
              }}
            />
            <Button 
              hasIconOnly
              kind='danger'
              iconDescription='Delete Image'
              renderIcon={TrashCan}
              onClick={() => {
                imageToDelete.current = {name:item.fileName}
                setConfirmDeleteImageModalOpen(true);
              }}
            />
          </div>
        </>
      }
    ));
    setImageListData(imageList);
    setShowImageTable('block');
    setShowImageTableSkeleton('none');
  }

  async function DeleteImage() {
    alert('deleted!')
  }

  function HandleFileChange(event) {
    if (event === 'remove') {
      setFileUploadStatus('edit');
      setFacilityImage(null);
      setFacilityImage(null);
      setImageUploadButtonDisabled(true);
      return;
    }
    console.log(event);
    setFileUploadStatus('uploading');
    const file = event.target.files[0];
    if ("image/png" || "image/jpg" || "image/jpeg") {
      let fileReader = new FileReader();
      fileReader.onloadend = event => setUploadImageData(event.target.result);
      fileReader.readAsDataURL(file);
      setFacilityImage(file);
      setFileUploadStatus('complete');
      setImageUploadButtonDisabled(false);
    };
  }

  return (
    <>
      <Modal
        id="ConfirmDeleteModal"
        danger
        size='sm'
        open={confirmDeleteModalOpen}
        modalHeading='Confirm Delete'
        modalAriaLabel="confirm delete modal"
        onRequestClose={() => {
          setConfirmDeleteModalOpen(false);
          facilityToDelete.current = {id:'',name:''};
        }}
        onRequestSubmit={() => DeleteFacility()}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        children={`Are you sure you want to delete ${facilityToDelete.current.name}?`}
      />
      <Modal
        id="addEditModal"
        open={addEditModalOpen}
        modalHeading={addEditData.action === "add" ? "Add Office":`Edit ${addEditData.name}`}
        modalAriaLabel="Add/Edit modal"
        onRequestClose={() => {
          setAddEditModalOpen(false);
          setAddEditData(emptyFacilityData);
        }}
        onRequestSubmit={() => AddEditFacility()}
        primaryButtonText={`${addEditData.action.charAt(0).toUpperCase()}${addEditData.action.slice(1)}`}
        secondaryButtonText="Cancel"
        children={
          <Form>
            <Stack gap={5}>
              <TextInput
                id="name"
                labelText="Name"
                value={addEditData.name}
                onChange={event => setAddEditData(previousState => ({...previousState, name:event.target.value}))}
              />
              <ComboBox
                id="organization"
                titleText="Assigned Organization"
                label="Select"
                items={organizationData}
                selectedItem={addEditData.organization}
                itemToString={item => (item ? item.name : '')}
                onChange={event => {setAddEditData(previousState => ({...previousState, organization:event.selectedItem}))}}
              />
              <TextInput
                id="address"
                labelText="Address"
                value={addEditData.address}
                onChange={event => setAddEditData(previousState => ({...previousState, address:event.target.value}))}
              />
              <div style={{display:'grid', gap:'2rem', alignItems:'baseline', gridTemplateColumns:'2fr 1.5fr 1fr'}}>
                <div>
                  <TextInput
                    id="city"
                    labelText="City"
                    value={addEditData.city}
                    onChange={event => setAddEditData(previousState => ({...previousState, city:event.target.value}))}
                  />
                </div>
                <div> 
                  <Dropdown
                    id="state"
                    titleText="State"
                    label="Select"
                    items={states}
                    selectedItem={addEditData.state}
                    itemToString={item => (item ? item.text : '')}
                    onChange={event => {setAddEditData(previousState => ({...previousState, state:event.selectedItem}))}}
                  />
                </div>
                <div>
                  <TextInput
                    id="zip"
                    labelText="Zip"
                    value={addEditData.zip}
                    onChange={event => setAddEditData(previousState => ({...previousState, zip:event.target.value}))}
                  />
                </div>
              </div>
              <div style={{display:'flex', gap:'2rem'}}>
                <div>
                  <TextInput
                    id="latitude"
                    labelText="Latitude"
                    value={addEditData.lat}
                    onChange={event => setAddEditData(previousState => ({...previousState, lat:event.target.value}))}
                  />
                </div>
                <div>
                  <TextInput
                    id="longitude"
                    labelText="Longitude"
                    value={addEditData.long}
                    onChange={event => setAddEditData(previousState => ({...previousState, long:event.target.value}))}
                  />
                </div>
              </div>
              <TextInput
                id="facilityCode"
                labelText="Facility Code"
                value={addEditData.facilityCode}
                onChange={event => setAddEditData(previousState => ({...previousState, facilityCode:event.target.value}))}
              />
            </Stack>
          </Form>
        }
      />
      <Modal
        id="ConfirmDeleteImageModal"
        danger
        size='sm'
        open={confirmDeleteImageModalOpen}
        modalHeading='Confirm Delete'
        modalAriaLabel="confirm delete image modal"
        onRequestClose={() => {
          setConfirmDeleteImageModalOpen(false);
          imageToDelete.current = {name:''}
        }}
        onRequestSubmit={() => DeleteImage()}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        children={`Are you sure you want to delete ${imageToDelete.current.name}?`}
      />
      <Modal
        id="imagePreviewModal"
        open={imagePreviewModalOpen}
        modalHeading=""
        modalAriaLabel="image preview"
        onRequestClose={() => {
          setImagePreviewModalOpen(false);
          setFacilityImage("");
        }}
        onRequestSubmit={() => {
          setImagePreviewModalOpen(false);
          setFacilityImage('');
        }}
        primaryButtonText='Close'
        children={
          <>
            <div style={{display:showImage, display:'flex', justifyContent:'center'}}>
                <img style={{maxWidth:'45vw'}} alt={'image'} src={`data:image/png;base64,${faciliityImage}`}/>
            </div>
            <div style={{display:showImageLoading}}>
              <Loading withOverlay={false}/>
            </div>
          </>
        }
      />
      <Modal
        id="imageUploadModal"
        open={imageUploadModalOpen}
        modalHeading="Facility Image Upload"
        modalAriaLabel="facility image upload"
        onRequestClose={() => {
          setImageUploadModalOpen(false);
          HandleFileChange('remove');
        }}
        onRequestSubmit={() => {
          setImageUploadModalOpen(false);
        }}
        primaryButtonText='Upload'
        secondaryButtonText='Cancel'
        primaryButtonDisabled={imageUploadButtonDisabled}
        children={
          <>
            <div style={{
              display:showImage, 
              display:'flex', 
              justifyContent:'center',
              alignItems:'center',
              height:'15rem'}}
            >
              {
                faciliityImage ?
                  <img style={{maxWidth:'auto', maxHeight:'25vh'}} alt={'image'} src={uploadImageData}/>:
                  <div><NoImage size={128}/></div>
              }
            </div>
            <div className="cds--file__container">
              <FileUploader
                labelTitle="Upload Image"
                labelDescription="Max file size is 2mb. Only .jpg and .png files are supported."
                buttonLabel="Add image file"
                buttonKind="primary"
                size="md"
                filenameStatus={fileUploadStatus}
                accept={['.jpg', '.png']}
                multiple={false}
                disabled={false}
                iconDescription="Delete file"
                name=""
                onChange={event => HandleFileChange(event)}
                onDelete={() => HandleFileChange('remove')}
              />
            </div>
          </>
        }
      />
      <AdminHeader activeSideBarItem="facilities"/>
      <Content className='pageContent'>
        <Tabs>
          <TabList aria-label="List of tabs">
            <Tab><Building size={18}/> Facilities</Tab>
            <Tab onClick={() => GetImageList()}><Image size={18}/> Images</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div style={{display:showDataTable}}> 
                <DataTable rows={facilityData} headers={facilitiesTableHeader} isSortable>
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
                      title='Facilities'
                      description='Displays a list of all facilities registered in the database.'
                    >
                      <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                        <TableToolbarContent>
                          <TableToolbarSearch onChange={onInputChange}/>
                          <Button
                            hasIconOnly
                            aria-label='add faciliity'
                            iconDescription='Add Facility'
                            renderIcon={Add}
                            onClick={() => {
                              setAddEditData({
                                action:"add",
                                name:"",
                                organization:"",
                                facilityCode:"",
                                address:"",
                                city:"",
                                state:"",
                                zip:"",
                                image:'',
                                lat:0,
                                long:0
                              });
                              setAddEditModalOpen(true);
                            }}
                          />
                        </TableToolbarContent>
                      </TableToolbar>
                      <Table {...getTableProps()}>
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                {header.header}
                              </TableHeader>
                            ))}
                            <TableHeader />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id} {...getRowProps({ row })}>
                              {row.cells.map((cell) => (
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
                  headers={facilitiesTableHeader}
                />
              </div>
              <div className='rightPane' style={{transform:showRightPane}}>
                <div className='closeButtonContainer'>
                  <div>
                    <CloseOutline 
                      className='closeButton'
                      size={28}
                      onClick={() => {
                        setShowRightPane('translateX(35rem)');
                        setAddEditData(emptyFacilityData);
                      }}
                    />
                  </div>
                </div>
                <div className='rightPaneContent'>
                  <div style={{display:'flex', gap:'2rem'}}>
                    <div style={{display:showImage}}>
                      <Tile>
                        <img className="tileImage" alt={'image'} src={`data:image/png;base64,${faciliityImage}`}></img>
                      </Tile>
                    </div>
                    <div style={{display:showImageLoading}}>
                      <Loading className={'some-class'} withOverlay={false} />
                    </div>
                    <div>
                      <p><strong>{addEditData.name}</strong></p>
                    </div>
                  </div>
                  <hr/>
                  <Form>
                    <Stack gap={5}>
                      <TextInput
                        id="name"
                        labelText="Name"
                        value={addEditData.name}
                        onChange={event => setAddEditData(previousState => ({...previousState, name:event.target.value}))}
                        />
                      <ComboBox
                        id="organization"
                        titleText="Assigned Organization"
                        label="Select"
                        items={organizationData}
                        selectedItem={addEditData.organization}
                        itemToString={item => (item ? item.name : '')}
                        onChange={event => {setAddEditData(previousState => ({...previousState, organization:event.selectedItem}))}}
                        />
                      <TextInput
                        id="address"
                        labelText="Address"
                        value={addEditData.address}
                        onChange={event => setAddEditData(previousState => ({...previousState, address:event.target.value}))}
                        />
                      <div style={{display:'grid', gap:'2rem', alignItems:'baseline', gridTemplateColumns:'2fr 1.5fr 1fr'}}>
                        <div>
                          <TextInput
                            id="city"
                            labelText="City"
                            value={addEditData.city}
                            onChange={event => setAddEditData(previousState => ({...previousState, city:event.target.value}))}
                          />
                        </div>
                        <div> 
                          <Dropdown
                            id="state"
                            titleText="State"
                            label="Select"
                            items={states}
                            selectedItem={addEditData.state}
                            itemToString={item => (item ? item.text : '')}
                            onChange={event => {setAddEditData(previousState => ({...previousState, state:event.selectedItem}))}}
                          />
                        </div>
                        <div>
                          <TextInput
                            id="zip"
                            labelText="Zip"
                            value={addEditData.zip}
                            onChange={event => setAddEditData(previousState => ({...previousState, zip:event.target.value}))}
                          />
                        </div>
                      </div>
                      <div style={{display:'flex', gap:'2rem'}}>
                        <div>
                          <TextInput
                            id="latitude"
                            labelText="Latitude"
                            value={addEditData.lat}
                            onChange={event => setAddEditData(previousState => ({...previousState, lat:event.target.value}))}
                            />
                        </div>
                        <div>
                          <TextInput
                            id="longitude"
                            labelText="Longitude"
                            value={addEditData.long}
                            onChange={event => setAddEditData(previousState => ({...previousState, long:event.target.value}))}
                            />
                        </div>
                      </div>
                      <TextInput
                        id="facilityCode"
                        labelText="Facility Code"
                        value={addEditData.facilityCode}
                        onChange={event => setAddEditData(previousState => ({...previousState, facilityCode:event.target.value}))}
                        />
                        <Button onClick={() => AddEditFacility()}>Save</Button>
                    </Stack>
                  </Form>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div style={{display:showImageTable}}> 
                <DataTable 
                  isSortable
                  rows={imageListData} 
                  headers={[
                    {key:'name', header:'Image Name'},
                    {key:'createdAt', header:'Date Created'},
                    {key:'size', header:'Size'},
                    {key:'action', header:'Action'}
                  ]} 
                >
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
                      title='Facility Images'
                      description='Displays a list of all facility images.'
                    >
                      <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                        <TableToolbarContent>
                          <TableToolbarSearch onChange={onInputChange} />
                          <Button
                            hasIconOnly
                            aria-label='upload image'
                            iconDescription='Upload Image'
                            renderIcon={Upload}
                            onClick={() => setImageUploadModalOpen(true)}
                          />
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
              <div style={{display:showImageTableSkeleton}}>
                <DataTableSkeleton
                  showHeader
                  showToolbar
                  headers={[
                    {key:'name', header:'Image Name'},
                    {key:'createdAt', header:'Date Created'},
                    {key:'size', header:'Size'},
                    {key:'action',header:'Action'}
                  ]}
                />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Content>
    </>
  );
};