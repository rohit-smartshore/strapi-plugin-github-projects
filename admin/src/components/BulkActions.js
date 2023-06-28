import { Box, Button, Flex, Typography } from "@strapi/design-system";
import React, { useState } from "react";
import ConfirmationDialog from "./ConfirmationDailog";

const BulkActions = ({selectedRepos,bulkCreateAction,bulkDeleteAction}) => {

  const reposWithoutProject = selectedRepos.filter((repo)=> !repo.projectId);
  const reposWithProject = selectedRepos.filter((repo)=> repo.projectId);
  const projectsToBeCreated = reposWithoutProject.length;
  const projectsToBeDeleted = reposWithProject.length;
  const projectIdsToBeDeleted = reposWithProject.map((repo) => repo.projectId);
  const [dialogVisible,setDialogVisible] = useState(false);
    return (
      <Box paddingBottom={4} >
        <Flex>
          <Typography>
            {`You have ${projectsToBeCreated} projects to generate and ${projectsToBeDeleted} to delete`}
          </Typography>
          {projectsToBeCreated > 0 &&(
          <Button
            marginLeft={2}
            size="S"
            variant="success-light"
            onClick={() => bulkCreateAction(reposWithoutProject)}
          >
            {`Create ${projectsToBeCreated} project(s)`}
          </Button>)}
          {projectsToBeDeleted > 0 &&(
          <Button
            marginLeft={2}
            size="S"
            variant="danger-light"
            onClick={()=> setDialogVisible(true)}
          >
            {`Delete ${projectsToBeDeleted} project(s)`}
          </Button>)}
        </Flex>
        <ConfirmationDialog 
        visible={dialogVisible}
        message="Are you sure you want to delete these projects?"
        onClose={() => setDialogVisible(false)}
        onConfirm={() => bulkDeleteAction(projectIdsToBeDeleted)}
        />
      </Box>
    )
}

export default BulkActions