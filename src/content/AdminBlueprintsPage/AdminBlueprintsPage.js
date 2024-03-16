import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  Button,
  ButtonSet,
  ComboBox,
  Content,
  DataTable,
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
  Edit,
  Floorplan,
  Image,
  NoImage,
  TrashCan,
  Upload
} from '@carbon/react/icons';

export default function AdminFacilitiesPage() {
  
  const blueprintTableHeader = [
    {key:'blueprintId', header:'Blueprint ID'},
    {key:'name', header:'Name'},
    {key:'facility', header:'Facility'},
    {key:'image', header: 'Image'},
    {key:'action', header:'Action'}
  ]

  const emptyBlueprintData = {
    action:'',
    id:'',
    facility:{id:0,name:''},
    name:'',
    image:''
  }

  const jwt = sessionStorage.getItem("ervaJwt");

  const fileUploaderRef = useRef();

  const [blueprintData, setBlueprintData] = useState([]);
  const [facilityData, setFacilityData] = useState([{id:0,name:''}]);
  const [blueprintImage, setBlueprintImage] = useState({imageData:'',fileName:''});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [blueprintModData, setBlueprintModData] = useState(emptyBlueprintData);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [showDataTable, setShowDataTable] = useState('none');
  const [showTableSkeleton, setShowTableSekeleton] = useState('block');
  const [showRightPane, setShowRightPane] = useState('translateX(60rem)');
  const [showImageTable, setShowImageTable] = useState('none');
  const [showImageTableSkeleton, setShowImageTableSkeleton] = useState('block')
  const [showImage, setShowImage] = useState('none');
  const [showImageLoading, setShowImageLoading] = useState('none');
  const [imageComboBoxItems, setImageComboBoxItems] = useState([{id:0,fileName:'initialLoad'}])
  const [imageListData, setImageListData] = useState([]);
  const [confirmDeleteImageModalOpen, setConfirmDeleteImageModalOpen] = useState(false);
  const [imagePreviewModalOpen, setImagePreviewModalOpen] = useState(false);
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const [modImageData, setModImageData] = useState({action:'', data:'', name:''});
  const [fileUploadStatus, setFileUploadStatus] = useState('edit');
  const [imageUploadButtonDisabled, setImageUploadButtonDisabled] = useState(true);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({heading:'',message:''});
  const [formValidation, setFormValidation] = useState({nameInvalid:false, facilityInvalid:false});

  useEffect(() => {GetFacilities();},[]);
  useEffect(() => {
    GetBlueprints();
    GetImageList('combobox');
  },[facilityData])

  async function GetFacilities() {
    
    const query = `
      query {
        getFacilities {
          id
          name
          city
          state
        }
      }`;

    const facilitiesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers: {
        'Content-Type':'application/json',
        Accept: "application/json",
        Authorization:`Bearer ${jwt}`,
      },
      body: JSON.stringify({ query })});

    const facilitiesResponse = await facilitiesRequest.json();
    const facilities = facilitiesResponse.data.getFacilities.map(facility => (  
      {
        id:parseInt(facility.id),
        name:`${facility.name} (${facility.city}, ${facility.state})`
      }
    ));
    setFacilityData(facilities);
  };
  
  async function GetBlueprints() {
    setShowDataTable('none');
    setShowTableSekeleton('block');
    const query = `
      query {
        getBlueprints {
          id
          facilityId
          name
          image
        }
      }
    `;
    const blueprintsRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers: {
        'Content-Type':'application/json',
        Accept: "application/json",
        Authorization:`Bearer ${jwt}`,
      },
      body: JSON.stringify({ query })
    });

    const blueprintsResponse = await blueprintsRequest.json();
    const blueprints = blueprintsResponse.data.getBlueprints.map((blueprint, index) => (
      {
        id:String(index),
        blueprintId:blueprint.id,
        facility:facilityData.find(facility => parseInt(facility.id) === parseInt(blueprint.facilityId)).name,
        name:blueprint.name,
        image:blueprint.image,
        action:<>
          <div>
            <Button
              hasIconOnly
              kind='ghost'
              renderIcon={Edit}
              iconDescription='Edit Blueprint'
              onClick={() => {
                setBlueprintModData({
                  action:"edit",
                  id:blueprint.id,
                  facility:facilityData.find(facility => parseInt(facility.id) === parseInt(blueprint.facilityId)),
                  name:blueprint.name,
                  image:imageComboBoxItems.find(image => image.fileName === blueprint.image) 
                });
                setShowRightPane('translateX(0rem)');
                GetImage(blueprint.image);
                if(imageComboBoxItems[0].fileName === 'initialLoad') GetImageList();
              }}
            />
            <Button
              hasIconOnly
              kind='danger--ghost'
              renderIcon={TrashCan}
              iconDescription='Delete Blueprint'
              onClick={() => {
                setBlueprintModData(previousState => ({
                  ...previousState,
                  action:'delete',
                  id:blueprint.id,
                  name:blueprint.name
                }));
                setConfirmDeleteModalOpen(true);
              }}
            />
          </div>
        </>
      }
    ));
    setBlueprintData(blueprints);
    setShowTableSekeleton('none');
    setShowDataTable('block');
  }

  function VerifyForm() {
    console.log(blueprintModData);
    let valid = true;
    switch (blueprintModData.action) {
      case "add":
      case "edit":
        if (blueprintModData.name === "" || blueprintModData.name === null) {
          valid = false;
          setFormValidation(previousState => ({...previousState, nameInvalid:true}));
        };
        if (blueprintModData.facility === "" || blueprintModData.facility === null) {
          valid = false;
          setFormValidation(previousState => ({...previousState, facilityInvalid:true}));
        };
        break;
      case "delete":
        break
    };
    if (!valid) return false;
    if (valid) return true;
  }

  async function ModifyBlueprint() {
    const isValid = VerifyForm();
    if (!isValid) return;
    if (addModalOpen) setAddModalOpen(false);
    if (showRightPane === 'translateX(0rem)') setShowRightPane('translateX(60rem)');

    const query = `
      mutation($data: BlueprintData) {
        modBlueprint(blueprintData:$data) {
          success
          errorCode
          errorMessage
        }
      }
    `;
    
    const modRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      method:'POST',
      mode:'cors',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer ${jwt}`
      },
      body:JSON.stringify({
        query,
        variables: {
          data: {
            ...blueprintModData,
            facility:parseInt(blueprintModData.facility.id),
            image:blueprintModData.image.fileName
          }
        }
      })
    });
    const modResponse = await modRequest.json();
    setBlueprintModData(emptyBlueprintData);
    if (modResponse.data.modBlueprint.success) GetBlueprints();
    if (!modResponse.data.modBlueprint.success) {
      setErrorInfo({
        heading:modResponse.data.modBlueprint.errorCode,
        message:modResponse.data.modBlueprint.errorMessage
      });
      setErrorModalOpen(true);
    };
  };

  async function GetImage(imageName) {
    if (imageName.length === 0) {
      setShowImageLoading('none');
      setShowImage('block');
      return;
    }
    if (showImage === 'block') setShowImage('none');
    if (showImageLoading === 'none') setShowImageLoading('block');
    const query = `
      query {
        getImage(type:"blueprint", name:"${imageName}") {
          name
          data
          success
          message
        }
      }
    `;
    const imageRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer ${jwt}`
      },
      body:JSON.stringify({ query })
    });
    const imageResponse = await imageRequest.json();
    if (!imageResponse.data.getImage.success) {
      setErrorInfo({heading:imageResponse.code,message:imageResponse.message})
      setErrorModalOpen(true);
      return;
    };
    setBlueprintImage({
      imageData:imageResponse.data.getImage.data,
      fileName:imageResponse.data.getImage.name
    });
    setShowImageLoading('none');
    setShowImage('block');
  }

  async function GetImageList(request) {
    if (showImageTable === 'block') setShowImageTable('none');
    if (showImageTableSkeleton) setShowImageTableSkeleton('block');
    const query = `
      query {
        getImageList(type: "blueprint") {
          name
          createdAt
          size
        }
      }
    `;
    const listRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer ${jwt}`
      },
      body:JSON.stringify({ query })
    });
    const listResponse = await listRequest.json();

    if (request === 'combobox') {
      const comboBoxItems = listResponse.data.getImageList.map(image => ({fileName:image.name}))
      setImageComboBoxItems(comboBoxItems);
      return;
    };

    const imageList = listResponse.data.getImageList.map((item, index) => (
      {
        id:String(index),
        name:item.name,
        createdAt:item.createdAt,
        size:`${Math.round(((item.size)/1024 * 100))/100} ${(item.size)/1024 <= 1024 ? "KB":"MB"}`,
        action:<>
          <div style={{display:'flex', gap:'0.125rem'}}> 
            <Button 
              hasIconOnly
              kind='ghost'
              iconDescription='View Image'
              renderIcon={Image}
              onClick={() => {
                setImagePreviewModalOpen(true);
                GetImage(item.name);
              }}
            />
            <Button 
              hasIconOnly
              kind='danger--ghost'
              iconDescription='Delete Image'
              renderIcon={TrashCan}
              onClick={() => {
                setModImageData({
                  action:'delete',
                  type:'facility',
                  name:item.name
                })
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

  function HandleFileChange(event) {
    if (event === 'remove') {
      fileUploaderRef.current.clearFiles();
      setFileUploadStatus('edit');
      setBlueprintImage({imageData:'',fileName:''});
      setModImageData({name:'', data:''})
      setImageUploadButtonDisabled(true);
      return;
    }
    setFileUploadStatus('uploading');
    const file = event.target.files[0];
    const fileName = event.target.value.split('\\')[2];
    if (fileName.split('.')[1] === "png" || fileName.split('.')[1] === "jpg" || fileName.split('.')[1] === "jpeg") {
      let fileReader = new FileReader();
      fileReader.onloadend = event => setModImageData({
        action:'upload',
        type:'blueprint',
        name:fileName,
        data:event.target.result
      });
      fileReader.readAsDataURL(file);
      setFileUploadStatus('edit');
      setImageUploadButtonDisabled(false);
    };
  };

  async function ModImage() {
    if (imageUploadModalOpen) setImageUploadModalOpen(false);
    if (confirmDeleteImageModalOpen) setConfirmDeleteImageModalOpen(false);

    const query = `
      mutation ($data: ImageData) {
        modImage(imageData: $data) {
          success
          errorCode
          errorMessage
        }
      }
    `;

    const uploadRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer ${jwt}`
      },
      body:JSON.stringify({ 
        query,
        variables: { data: modImageData }
      })
    });
    const uploadResponse = await uploadRequest.json();
    fileUploaderRef.current.clearFiles();
    setModImageData({
      action:'',
      type:'',
      name:'',
      data:''
    });

    if (uploadResponse.data.modImage.success) GetImageList();
    if (!uploadResponse.data.modImage.success) {
      setErrorInfo({
        heading:uploadResponse.data.modImage.errorCode,
        message:uploadResponse.data.modImage.errorMessage
      });
      setErrorModalOpen(true);
    }
  }

  function CloseRightPane() {
    setFormValidation({nameInvalid:false, facilityInvalid:false});
    setBlueprintImage({imageData:'',fileName:''});
    setShowRightPane('translateX(60rem)');
    setBlueprintModData(emptyBlueprintData);
  };

  return (
    <>
      <Modal
        id='ErrorModal'
        size='sm'
        open={errorModalOpen}
        modalHeading={errorInfo.heading}
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
        children={<><p>{errorInfo.message}</p></>}
      />
      <Modal
        id="ConfirmDeleteModal"
        danger
        size='sm'
        open={confirmDeleteModalOpen}
        modalHeading='Confirm Delete'
        modalAriaLabel="confirm delete modal"
        onRequestClose={() => {
          setConfirmDeleteModalOpen(false);
          setBlueprintModData(emptyBlueprintData);
        }}
        onRequestSubmit={() => {
          setConfirmDeleteModalOpen(false);
          ModifyBlueprint();
        }}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        children={`Are you sure you want to delete ${blueprintModData.name}?`}
      />
      <Modal
        id="addModal"
        size='sm'
        open={addModalOpen}
        modalHeading="Add Blueprint"
        modalAriaLabel="Add modal"
        onRequestClose={() => {
          setAddModalOpen(false);
          setFormValidation({nameInvalid:false, facilityInvalid:false});
          setBlueprintModData(emptyBlueprintData);
        }}
        onRequestSubmit={() => ModifyBlueprint()}
        primaryButtonText="Add"
        secondaryButtonText="Cancel"
        children={
          <Form>
            <Stack gap={5}>
              <TextInput
                id="name"
                labelText="Name"
                value={blueprintModData.name}
                invalid={formValidation.nameInvalid}
                invalidText={"Please enter a blueprint name"}
                onChange={event => {
                  if (formValidation.nameInvalid) setFormValidation(previousState => ({...previousState, nameInvalid:false}));
                  setBlueprintModData(previousState => ({...previousState, name:event.target.value}));
                }}
              />
              <ComboBox
                id="blueprintImage"
                titleText="Image"
                label="Select"
                items={imageComboBoxItems}
                selectedItem={blueprintModData.image}
                itemToString={item => (item ? item.fileName : '')}
                onChange={event => {
                  setBlueprintModData(previousState => ({...previousState, image:event.selectedItem}))
                  GetImage(event.selectedItem.fileName);
                }}
              />
              <ComboBox
                id="facility"
                titleText="Assigned Facility"
                label="Select"
                items={facilityData}
                selectedItem={blueprintModData.facility}
                itemToString={item => (item ? item.name : '')}
                invalid={formValidation.facilityInvalid}
                invalidText="Please select a facility"
                onChange={event => {
                  if (formValidation.facilityInvalid) setFormValidation(previousState => ({...previousState, facilityInvalid:false}));
                  setBlueprintModData(previousState => ({...previousState, facility:event.selectedItem}));
                }}
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
          setModImageData({
            action:'',
            name:'',
            data:''
          });
        }}
        onRequestSubmit={() => ModImage()}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        children={`Are you sure you want to delete ${modImageData.name}?`}
      />
      <Modal
        id="imagePreviewModal"
        open={imagePreviewModalOpen}
        modalHeading={blueprintImage.fileName}
        modalAriaLabel="image preview"
        onRequestClose={() => {
          setImagePreviewModalOpen(false);
          //delay clearing the image data so the modal displays correctly until not visible.
          setTimeout(() => setBlueprintImage({imageData:'',fileName:''}),750);
        }}
        onRequestSubmit={() => {
          setImagePreviewModalOpen(false);
          //delay clearing the image data so the modal displays correctly until not visible.
          setTimeout(() => setBlueprintImage({imageData:'',fileName:''}),750);
        }}
        primaryButtonText='Close'
        children={
          <div style={{display:'flex', justifyContent:'center', alignContent:'center'}}>
            <div style={{display:showImage}}>
                <img style={{maxWidth:'45vh'}} alt={'image'} src={`data:image/png;base64,${blueprintImage.imageData}`}/>
            </div>
            <div style={{display:showImageLoading}}>
              <Loading withOverlay={false}/>
            </div>
          </div>
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
        onRequestSubmit={() => ModImage()}
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
                modImageData.data ?
                  <img style={{maxWidth:'auto', maxHeight:'25vh'}} alt={'image'} src={modImageData.data}/>:
                  <div><NoImage size={128} fill='lightgray'/></div>
              }
            </div>
            <div className="cds--file__container">
              <FileUploader
                ref={fileUploaderRef}
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
                onChange={event => HandleFileChange(event)}
                onDelete={() => HandleFileChange('remove')}
              />
            </div>
          </>
        }
      />
      <AdminHeader activeSideBarItem="blueprints"/>
      <Content className='pageContent'>
        <Tabs>
          <TabList aria-label="List of tabs">
            <Tab><Floorplan size={18}/> Blueprints</Tab>
            <Tab 
              onClick={() => {
                GetImageList();
                if (showRightPane === 'translateX(0rem)') setShowRightPane('translateX(60rem)');
                setBlueprintModData(emptyBlueprintData);
              }}
            >
              <Image size={18}/> Images
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div style={{display:showDataTable}}> 
                <DataTable rows={blueprintData} headers={blueprintTableHeader} isSortable>
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
                      title='Blueprints'
                      description='Displays a list of all blueprints registered in the database.'
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
                              setBlueprintModData({
                                action:"add",
                                name:"",
                                facility:"",
                                image:""
                              });
                              setAddModalOpen(true);
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
                  headers={blueprintTableHeader}
                />
              </div>
              <div className='rightPane' style={{transform:showRightPane}}>
                <div className='rightPaneHeader'>
                  <div style={{display:'flex', alignItems:'center'}}>
                    <div style={{display:showImage}}>
                      {
                        blueprintImage.imageData ?
                        <Tile>
                          <img className="tileImage" alt={'image'} src={`data:image/png;base64,${blueprintImage.imageData}`}></img>
                        </Tile>:
                        <Tile><NoImage size={128} color="lightgrey"/></Tile>
                      }
                      </div>
                    <div style={{display:showImageLoading}}>
                      <Loading withOverlay={false} />
                    </div>
                  </div>
                </div>
                <div className='rightPaneContent'>
                  <p><strong>{blueprintModData.name}</strong></p>
                  <hr/>
                  <Form>
                    <Stack gap={5}>
                      <TextInput
                        id="name"
                        labelText="Name"
                        value={blueprintModData.name}
                        invalid={formValidation.nameInvalid}
                        invalidText="Name field cannot be blank"
                        onChange={event => {
                          if (formValidation.nameInvalid) setFormValidation(previousState => ({...previousState, nameInvalid:false}));
                          setBlueprintModData(previousState => ({...previousState, name:event.target.value}))
                        }}
                      />
                      <ComboBox
                        id="facilityImage"
                        titleText="Image"
                        label="Select"
                        items={imageComboBoxItems}
                        selectedItem={blueprintModData.image}
                        itemToString={item => (item ? item.fileName : '')}
                        onChange={event => {
                          if (formValidation.facilityInvalid) setFormValidation(previousState => ({...previousState, facilityInvalid:false}))
                          if (event.selectedItem) GetImage(event.selectedItem.fileName);
                          setBlueprintModData(previousState => ({...previousState, image:event.selectedItem}));
                        }}
                      />
                      <ComboBox
                        id="facility"
                        titleText="Assigned Facility"
                        label="Select"
                        items={facilityData}
                        selectedItem={blueprintModData.facility}
                        itemToString={item => (item ? item.name : '')}
                        invalid={formValidation.facilityInvalid}
                        invalidText="Please select a facility"
                        onChange={event => {
                          setBlueprintModData(previousState => ({...previousState, facility:event.selectedItem}));
                          if (formValidation.facilityInvalid) setFormValidation(previousState => ({...previousState, facilityInvalid:false}));
                        }}
                      />
                      <div><hr/></div>
                      <ButtonSet>
                        <Button onClick={() => ModifyBlueprint()} kind="primary">Save</Button>
                        <Button onClick={() => CloseRightPane()} kind="secondary">Close</Button>
                      </ButtonSet>
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