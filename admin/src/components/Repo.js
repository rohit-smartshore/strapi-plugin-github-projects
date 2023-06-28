/*
 *
 * Repo Page
 *
 */

import React, { useEffect, useState } from 'react';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';
import { Box, Typography, BaseCheckbox, Loader, Alert, Link, Flex, IconButton } from '@strapi/design-system';
import axios from '../utils/axiosInstance';
import { Pencil, Trash, Plus } from '@strapi/icons';
import ConfirmationDailog from './ConfirmationDailog';
import BulkActions from './BulkActions';
// import PropTypes from 'prop-types';
// import pluginId from '../../pluginId';
const COL_COUNT = 5;


const Repo = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos,setSelectedRepos ] = useState([])
  const [alert, setAlert] =useState(undefined);
  const [deletingRepo, setdeletingRepo ] = useState(undefined);

  const showAlert = (alert) => {
    setAlert(alert);
    setTimeout(() => {
      setAlert(undefined);
    }, 5000);
  };
 
  const createProject = (repo)=> {
    axios.post('/github-projects/project', repo)
    .then((res) => {
      setRepos(repos.map((item) => item.id !== repo.id ? item : {
        ...item,
        projectId: res.data.id
      }))
      showAlert({
        title: "Project created",
        message: `Successfully created project ${res.data.title}`,
        variant: "success"
      })
    })
    .catch((error) => {
      showAlert({
        title: "An error occured",
        message: error.toString(),
        variant: "danger"
      })
    });
  }

  const deleteProject = async(repo) => {
    const { projectId } = repo;
    await axios.delete(`/github-projects/project/${projectId}`)
    .then((res) => {
      setRepos(repos.map((item) => item.id !== repo.id ? item : {
        ...item,
        projectId: null,
      }))
      showAlert({
        title: "Project deleted",
        message: `Successfully deleted project ${res.data.title}`,
        variant: "success",
      })
    })
    .catch((error) => {
      showAlert({
        title: "An error occured",
        message: error.toString(),
        variant: "danger"
      })
    }) 
  }

  const createAllProject = async (reposToProjects) => {
    await axios.post('/github-projects/projects', {repos: reposToProjects})
    .then((res) => {
      setRepos(repos.map((repo) => {
        const relatedProjectJustCreated = res.data.find((project) => project.repositoryId == repo.id);
        return !repo.projectId && relatedProjectJustCreated ?{
          ...repo,
          projectId: relatedProjectJustCreated.id
        }: repo;
        })
      )
      showAlert({
        title: "Projects created",
        message: `Successfully created ${res.data.length} projects `,
        variant: "success"
      })
    })
    .catch((error) => {
      showAlert({
        title: "An error occured",
        message: error.toString(),
        variant: "danger"
      });
    })
    .finally(() => {
      setSelectedRepos([]);
    })
   
    
  }

  const deleteAllProjects = async(projectIds) => {
    await axios.delete("/github-projects/projects", {
      params: {
        projectIds,
      }
    })
    .then((res) => {
      setRepos(repos.map((repo) => {
        const relatedProjectJustDeleted = res.data.find((project) => project.repositoryId == repo.id);
        return repo.projectId && relatedProjectJustDeleted ?{
          ...repo,
          projectId: null,
        }: repo;
        })
      )
      showAlert({
        title: "Projects Deleted",
        message: `Successfully deleted ${res.data.length} projects `,
        variant: "success"
      })
    })
    .catch((error) => {
      showAlert({
        title: "An error occured",
        message: error.toString(),
        variant: "danger"
      });
    })
    .finally(()=> {
      setSelectedRepos([]);
    }) 
  
  }

  const loadData = async()=>{
    await axios
      .get("/github-projects/repos")
      .then((res) => setRepos(res.data))
      .catch((error) => showAlert({
        title: "Error fetching repositories",
        message: error.toString(),
        variant: "danger"
      })); 
    }

  useEffect( () => {
    setLoading(true)
    //fecth data
      loadData()
    setLoading(false)
  }, []);

  if(loading) return <Loader />;

  const allChecked = selectedRepos.length == repos.length //all repos selected
  const isIndeterminate = selectedRepos.length > 0 && !allChecked // some repos selected
  
  return ( 
    <Box padding={8} background="neutral100">
      {alert&& (
        <div style={{position: "absolute", top:0, left:"14%", zIndex: 10}}>
          <Alert closeLabel="Close alert" title={alert.title} variant={alert.variant}>
            {alert.message}
          </Alert>
        </div>
      )}
      {selectedRepos.length > 0 &&(
        <BulkActions 
            selectedRepos={selectedRepos.map((repoId)=>  
              repos.find((repo)=> repo.id == repoId) 
              )}
              bulkCreateAction={createAllProject}
              bulkDeleteAction={deleteAllProjects} 
        />
      )}
        <Table colCount={COL_COUNT} rowCount={repos.length} >
        <Thead>
              <Tr>
                <Th>
                  <BaseCheckbox 
                    aria-label="Select all entries" 
                    value={allChecked} 
                    indeterminate={isIndeterminate} 
                    onValueChange={value => value ? setSelectedRepos(repos.map((repo) => repo.id)): setSelectedRepos([])}
                  />
                </Th>
                <Th>
                  <Typography variant="sigma">name</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Description</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Url</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Actions</Typography>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {repos.map(repo => {
                const {id, name, shortDescription, url, projectId } = repo;
                return (
                <Tr key={id}>
                  <Td>
                    <BaseCheckbox 
                      aria-label={`Select ${id}`}
                      value={ selectedRepos.includes(id) } 
                      onValueChange={(value) => {
                        const newSelectedRepos = value
                        ? [...selectedRepos, id]
                        : selectedRepos.filter((item) => item !== id);
                        setSelectedRepos(newSelectedRepos)
                      }}
                    />
                  </Td>
                  <Td>
                    <Typography textColor="neutral800">{id}</Typography>
                  </Td>
                  <Td>
                    <Typography textColor="neutral800">{shortDescription}</Typography>
                  </Td>
                  <Td>
                    <Typography textColor="neutral800">
                      <Link href={url} isExternal>{url}</Link>
                    </Typography>
                  </Td>
                  <Td>
                    { projectId ?
                      <Flex>
                      <Link to={`/content-manager/collectionType/plugin::github-projects.project/${projectId}`}>
                        <IconButton onClick={() => console.log('delete')} label="Edit" noBorder icon={<Pencil />} />
                      </Link>
                      <Box paddingLeft={1}>
                        <IconButton onClick={() => setdeletingRepo(repo)} label="Delete" noBorder icon={<Trash />} />
                      </Box>
                    </Flex>:
                    (
                      <IconButton onClick={() => createProject(repo)} label="Add" noBorder icon={<Plus />} />
                    )}
                  </Td>
                </Tr>)})}
            </Tbody>
        </Table>
        {deletingRepo && (
        <ConfirmationDailog 
          visible={!!deletingRepo} 
          message="Are you sure you want to delete this project?" 
          onClose={() => setdeletingRepo(undefined)}
          onConfirm={() => deleteProject(deletingRepo)}
        />
      )}
    </Box>
  );
};

export default Repo;
