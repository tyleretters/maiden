import React, { Component } from 'react';

import Switcher from './components/switcher';
import CatalogList from './components/catalog-list';
import ProjectList from './components/project-list';

import ModalContent from './modal-content';
//import IconButton from './icon-button';
//import { ICONS } from './svg-icons';

import './project-activity.css';

class ProjectActivity extends Component {
  componentDidMount() {
    this.props.getCatalogSummary(summary => {
      summary.get('catalogs').forEach(detail => {
       const url = detail.get('url');
       this.props.getCatalogByURL(url);
      });
    });
    this.props.getProjectSummary();
  };

  handleTabSelection = name => {
    this.props.projectViewSelect(name);
  };

  handleRefreshAction = url => {
    console.log('refreshing catalog', url);
    this.props.updateCatalog(url);
  };

  handleInstallAction = (url, name) => {
    console.log('doing install', url, name);
    this.props.installProject(url, name,
      _ => {
        // refresh project list
        this.props.getProjectSummary();
        this.props.refreshCodeDir();
      },
      failure => {
        console.log('install-project failed', failure);
        this.props.hideModal();  // FIXME: show error in new dialog
      });
  };

  handleUpdateAction = (url, name) => {
    console.log('doing update', url);

    // const modalDismiss = _ => {
    //   this.props.hideModal();
    // };

    const modalCompletion = choice => {
      if (choice === 'ok') {
        this.props.updateProject(url, name,
          _ => {
            this.props.getProjectSummary();
            this.props.refreshCodeDir();
            this.props.hideModal();
          },
          failure => {
            console.log('update-project failed', failure);
            this.props.hideModal(); // FIXME: show error in new dialog
            // this.props.updateModal({
            //   message: `Updating project "${name}" failed.`,
            //   supporting: failure,
            //   buttonAction: modalDismiss,
            // })
          });
      } else {
        // update request canceled
        this.props.hideModal();
      }
    };

    const modalContent = (
      <ModalContent
        message={`Update project "${name}"?`}
        supporting="Locally modified changes can be overwritten"
        buttonAction={modalCompletion}
      />
    );

    this.props.showModal(modalContent);
  };

  handleRemoveAction = (url, name) => {
    console.log('doing remove', url);

    const modalCompletion = choice => {
      if (choice === 'ok') {
        this.props.removeProject(url, name,
          _ => {
            // refresh project list
            this.props.getProjectSummary();
            this.props.refreshCodeDir();
            this.props.hideModal();
          },
          failure => {
            // TODO: make this a dialog
            console.log('remove-project failed', failure);
            this.props.hideModal();
          });
      } else {
        // canel or any other outcome
        this.props.hideModal();
      }
    };

    const modalContent = (
      <ModalContent
        message={`Delete "${name}"?`}
        supporting="This operation cannot be undone."
        buttonAction={modalCompletion}
      />
    );

    this.props.showModal(modalContent);
  };

  render() {
    const switcherSize = {
      height: this.props.height - 10,  // FIXME: not sure why this is longer than it should be
      width: this.props.width,
    };

    return (
      <div className='project-activity-container'>
        <Switcher
          size={switcherSize}
          select={this.handleTabSelection}
          activeTab={this.props.activeComponent}
        >
          <ProjectList
            name='installed'
            projects={this.props.projectSummary}
            updateAction={this.handleUpdateAction}
            removeAction={this.handleRemoveAction}
          />
          <CatalogList
            name='available'
            catalogSummary={this.props.catalogSummary}
            catalogs={this.props.catalogs}
            installAction={this.handleInstallAction}
            refreshAction={this.handleRefreshAction}
          />
         </Switcher>
      </div>
    );
  };

}

export default ProjectActivity;
