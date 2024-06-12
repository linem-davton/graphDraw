
# Schedule Visualization Frontend

This project is a React-based frontend designed to visualize task schedules along with Application and Platform model. It interfaces with a [backend server](https://github.com/linem-davton/es-lab-task2), with the configuration specified in `config.json`, and is accessible at [eslab2.pages.dev](https://eslab2.pages.dev)


## Table of Contents
1. [Features](#features)
2. [For Users](#for-users)
3. [For Developers](#for-developers)


## Features


- **Upload JSON File**: Upload a JSON file with application and platform model as defined in [schema](https://eslab2docs.pages.dev/README#api-input-schema-for-schedule-jobs) to visualize the model.

- **Add Nodes and Edges**: Modify the existing application and platform model by adding tasks, dependencies, nodes, and links.

- **Graph Visualization**: Clear visualization of the application and platform models, making it easy to understand task dependencies and node links.

- **Scheduling Algorithms**: Schedule the graph using five different algorithms, with changes in input model reflected automatically.

- **Schedule Visualization**: Visualize the resulting schedules in a bar graph format, providing a clear overview of the task timeline.

- **Cross-Platform Compatibility**: The application works seamlessly across different devices and browsers.

## For Users
 ### Accessing the Application

  - Accesible at [eslab2.pages.dev](https://eslab2.pages.dev/).

  - **Upload JSON File**: Click on the "Upload JSON" button to upload a pre-defined Application model. The  JSON file should follow the input schema defined at [eslab2docs](https://eslab2docs.pages.dev/README#api-input-schema-for-schedule-jobs).
  - **Load Default Json**: Loads default application and platform model.

  - **Saving and Exporting**: Export the updated JSON file containing the application and platform model, including any changes, using the "Download JSON" button. Alternatively, "Save Locally" button allows you to save the models locally which can then be accessed on later page visits by using "Load Last Saved" button.


### Creating Application Model

  - **Add Tasks and Task Dependencies**: Create your own Application model by selecting the "Application model" on the screen. Use the "Add Tasks" button to create tasks individually and tasks dependencies using the "Add dependency" button.

  - **Adjusting Task Parameters**: WCET and deadline for a task can be changed by clicking on the task and adjusting the respective sliders.

  - **Delete Mode**: The tasks and Edges can be deleted by first clicking on the "Delete Mode" button then selecting the task or edge you want to delete.

  - **Generate Random Application Model**: Generate a random application model based on following parameters.
    - **Tasks (+int):** Number of tasks within the application model.
    - **Max WCET (+int):** Maximum Worst-Case Execution Time. For any task, WCET is chosen randomly between minWCET and maxWCET.
    - **Min WCET (+int):** Minimum Worst-Case Execution Time. Must be lower than Max WCET.
    - **Min MCET (+int):** Minimum Mean-Cycle Execution Time. Must be smaller than Max WCET. The MCET for task is chosen randomly between Min MCET and task's WCET.
    - **Deadline-WCET Offset (+int):** The minimum offset between the worst-case execution time and the task deadline. This ensures task's deadline always exceeds its WCET.
    - **Max Deadline (+int):** The maximum permissible deadline for any task within the application. Deadlines are chosen randomly between task's WCET + DeadlineOffset and Max Deadline.
    - **Link Probability (+float):** Probability that a link exists between any two tasks. This is used to randomly establish connections based on the likelihood provided. Link proability falls linearly as ditance between tasks increases.
    - **Max Message Size (+int):** The maximum size of messages that can be sent between tasks. This parameter impacts the simulation of data flow and network load.

  - **Visualizing the Application Model**: The application model will be displayed as a directed acyclic graph. Nodes represent tasks, and edges represent dependencies between tasks.

### Creating Platform Model
   
  - **Add Nodes and Links**: Create your own platform model by selecting the *Platform Model* on the screen. Use the *Add Node* button to create nodes individually and links using the *Add Link* button.

  - **Sliders**: Link delay and bandwidth  can be adjusted by selecting the edge and adjusting the respective sliders.

  - **Delete Mode**: The nodes and links can be deleted by first clicking on the "Delete Mode" button then selecting the node or link you want to delete.

  - **Generate Random Platform Model**: Generate a random platform model based on following parameters:
    - **Compute Nodes (+int):** Number of compute nodes in the model. These nodes are responsible for processing tasks and executing computations.
    - **Routers (+int):** Number of routers within the network. Routers manage the traffic between compute, sensor and actuator nodes and facilitate message passing.
    - **Sensors (+int):** Number of sensors integrated into the platform. Sensors gather data from the environment, which may influence task processing.
    - **Actuators (+int):** Number of actuators. Actuators are the devices that perform physical actions based on computational decisions.
    - **Max Link Delay (+int):** The maximum delay, in time units, that any link can introduce in the communication. The delay is randomly chosen between the minimum and maximum link delay.
    - **Min Link Delay (+int):** The minimum delay on any communication link.
    - **Max Bandwidth (+int):** The maximum bandwidth available on network links, determining the data carrying capacity. The bandwidth is chosen randomly between the minimum and maximum bandwidth.
    - **Min Bandwidth (+int):** The minimum bandwidth available, ensuring a base level of network performance.

  - **Visualizing the Platform Model**:The platform model will be displayed as a undirected graph. Nodes represent nodes, and edges represent links between the nodes.

### Hotkeys
   
   - **Tab**: Switches between the Application and Platform model.
   
   - **When Application Model is selected**:
      - **'1'** will add a task.
      - **'2'** will add a dependency.
      - **'w'** will cycle through the tasks.
      - **'d'** will delete the selected task.
         
   - **When Platform Model is selected**:
      - **'1'** will add a node.
      - **'2'** will add a link.
      - **'w'** will cycle through the links.
      - **'d'** will delete the selected link.
      
   - **Zooming and Panning** - Select a model then use the mouse wheel to zoom in and out and click and drag to pan.

### Visualizing Schedules

  - Along with the application and platform model, five different schedules will be fetched from the backend, representing different algorithms.
   
  - The resulting schedules will be visualized in a bar graph format.
   
  - Users can compare the different schedules generated by the algorithms.
   
  - Any changes made in the application or platform model will be immediately reflected in the schedules.


## Contributing
1. **Fork the front-end Repository**
  - Go to the project repositories
  - Frontend: [Github Repository](https://github.com/linem-davton/graphdraw-frontend.git).
  - Click on the "Fork" button to create a copy of the repository in your GitHub account.

2. **Clone the Repository**
  - Clone the forked repository to your local machine:
  - Clone Backend Repository: git clone https://github.com/linem-davton/es-lab-task2

3. **Navigate to the Project Directory**
   - Change to the project directory:
     ```BASH
     cd your-repo
     ```

4. **Install Dependencies**
   - Install the necessary dependencies for the frontend:
     ```BASH
     npm install
     ```
   
5. **Run the Application**
   - Start the backend server:
     python src/backend.py

   - Start the frontend development server:
      ```BASH
      npm run dev
      ```
     
   - Open your browser and navigate to `http://localhost:5173/` to view the application.

6. **Understanding the Project Structure**
   - Familiarize yourself with the project structure. Key directories include:
     - `src/` - Contains the React components and application logic.
     

7. **Making Changes**
   - Create a new branch for your feature or bugfix:
     git checkout -b feature/your-feature-name
     
   - Make your changes in the codebase.

   - Commit your changes with a descriptive commit message:
     
     ```BASH
      git commit -m "Add feature X"
      ```

- Push your changes to your forked repository:
    ```BASH
     git push origin feature
    ``` 

8. **Submitting a Pull Request**
    - Go to the original repository on GitHub.
    - Click on the "New Pull Request" button.
    - Select your branch and submit the pull request for review.

