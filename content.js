function setClaimDate(inputDate) {
    // Parse input date (yyyy-MM-dd HH:mm)
    const dateObj = new Date(inputDate.replace(/-/g, '/'));
    
    // Format to MM/dd/yyyy HH:mm
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}`;
    
    // Update input field
    const inputField = document.querySelector('input[name="CLAIM_DATE"]');
    if (inputField) {
        inputField.value = formattedDate;
        console.log(`Set CLAIM_DATE to: ${formattedDate}`);
    } else {
        console.error('Input field with name "CLAIM_DATE" not found');
    }
}

function setClaimType(claimType) {
    const select = document.querySelector('select[name="CLAIM_TYPE"]');
    if (select) {
        const option = select.querySelector(`option[value="${claimType}"]`);
        if (option) {
            select.value = claimType;
            console.log(`Set CLAIM_TYPE to: ${claimType}`);
        } else {
            console.error(`Option with value "${claimType}" not found`);
        }
    } else {
        console.error('Select element with name "CLAIM_TYPE" not found');
    }
}

function setVehicleType(travelTypeText) {
    const select = document.querySelector('select[name="TRAVEL_TYPE"]');
    if (!select) {
        console.error('Select element with name "TRAVEL_TYPE" not found');
        return;
    }
    
    const option = Array.from(select.options).find(
        (opt) => opt.text === travelTypeText
    );
    if (option) {
        select.value = option.value;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        console.log(`Set TRAVEL_TYPE to: ${travelTypeText}`);
    } else {
        console.error(
            `Option with text "${travelTypeText}" not found in TRAVEL_TYPE dropdown`
        );
    }
}

function setLocationFrom(locationCode) {
    const select = document.querySelector('select[name="LOC_FR"], select[name="LOC_ID"]');
    if (!select) {
        console.error('Select element with name "LOC_FR" or "LOC_ID" not found');
        return;
    }
    
    const option = Array.from(select.options).find(
        (opt) => opt.text === locationCode
    );
    if (option) {
        select.value = option.value;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        console.log(`Set location from to: ${locationCode}`);
    } else {
        const othOption = Array.from(select.options).find(
            (opt) => opt.text === 'OTH'
        );
        if (othOption) {
            select.value = othOption.value;
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
            console.log('Set location from to OTH');
        } else {
            console.error('Option "OTH" not found in location dropdown');
        }
        
        const input = document.querySelector('input[name="LOC_DESC_FR"], input[name="LOC_DESC"]');
        if (input) {
            input.value = locationCode;
            console.log(`Set LOC_DESC_FR/LOC_DESC to: ${locationCode}`);
        } else {
            console.error('Input field with name "LOC_DESC_FR" or "LOC_DESC" not found');
        }
    }
}

function setLocationTo(locationText) {
    const select = document.querySelector('select[name="LOC_TO"]');
    if (!select) {
        console.error('Select element with name "LOC_TO" not found');
        return;
    }
    
    const option = Array.from(select.options).find(
        (opt) => opt.text === locationText
    );
    if (option) {
        select.value = option.value;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        console.log(`Set location to: ${locationText}`);
    } else {
        const othOption = Array.from(select.options).find(
            (opt) => opt.text === 'OTH'
        );
        if (othOption) {
            select.value = othOption.value;
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
            console.log('Set location to OTH');
        } else {
            console.error('Option "OTH" not found in LOC_TO dropdown');
        }
        
        const input = document.querySelector('input[name="LOC_DESC_TO"]');
        if (input) {
            input.value = locationText;
            console.log(`Set LOC_DESC_TO to: ${locationText}`);
        } else {
            console.error('Input field with name "LOC_DESC_TO" not found');
        }
    }
}

function setLocation(locFrom, locTo) {
    setLocationFrom(locFrom);
    setLocationTo(locTo);
}

function setProjId(projectName) {
    const select = document.querySelector('select[name="PROJ_ID"]');
    if (!select) {
        console.error('Select element with name "PROJ_ID" not found');
        return;
    }
    
    const option = Array.from(select.options).find(
        (opt) => opt.text === projectName
    );
    if (option) {
        select.value = option.value;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        console.log(`Set PROJ_ID to: ${projectName}`);
    } else {
        console.error(
            `Option with text "${projectName}" not found in PROJ_ID select`
        );
    }
}

function setJobId(jobType) {
    const select = document.querySelector('select[name="JOB_ID"]');
    if (!select) {
        console.error('Select element with name "JOB_ID" not found');
        return;
    }
    
    const option = Array.from(select.options).find((opt) => opt.text === jobType);
    if (option) {
        select.value = option.value;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        console.log(`Set JOB_ID to: ${jobType}`);
    } else {
        console.error(`Option with text "${jobType}" not found in JOB_ID select`);
    }
}

function setAmt(money) {
    const input = document.querySelector('input[name="AMT"]');
    if (input) {
        input.value = money;
        console.log(`Set AMT to: ${money}`);
    } else {
        console.error('Input field with name "AMT" not found');
    }
}

window.updateClaimForm = (dateStr, claimType, money, proj, config) => {
    switch (claimType) {
        case 'am-travel':
            setClaimDate(dateStr + ' 07:15');
            setClaimType('TRAV');
            setVehicleType('MTR');
            setLocation(config.home, config.work);
            break;
        case 'pm-travel':
            setClaimDate(dateStr + ' 18:00');
            setClaimType('TRAV');
            setVehicleType('MTR');
            setLocation(config.work, config.home);
            break;
        case 'lunch':
            setClaimDate(dateStr + ' 13:00');
            setClaimType('MEAL');
            setVehicleType('Select Vehicle Type');
            setLocation('Select Location', 'Select Location');
            break;
        case 'office-travel':
            setClaimDate(dateStr + ' 15:30');
            setClaimType('TRAV');
            setVehicleType('MTR');
            setLocation('OFC', 'WKGO');
            break;
        default:
            console.error(`Unknown claim type: "${claimType}"`);
            break;
    }
    setProjId(proj);
    setJobId(config.job);
    setAmt(money);
};

async function retrieveSettingsFromChromeStorage() {
    try {
        const data = await chrome.storage.sync.get('azotsSettings');
        console.log('Raw data from chrome.storage.sync:', data);
        
        if (!data || !data.azotsSettings) {
            console.log('No settings found in chrome.storage.sync, using default values');
            return {
                home: 'Wong Tai Sin',
                work: 'HKCEC',
                job: 'T9',
                projects: [{ name: 'VRMS', checked: true }, { name: 'RTPCS', checked: false }],
                presets: []
            };
        }
        
        const settings = data.azotsSettings;
        console.log('Parsed settings object:', settings);
        
        // Relaxed validation
        if (typeof settings !== 'object' || settings === null) {
            console.warn('Invalid settings object, returning default values');
            return {
                home: 'Wong Tai Sin',
                work: 'HKCEC',
                job: 'T9',
                projects: [{ name: 'VRMS', checked: true }, { name: 'RTPCS', checked: false }],
                presets: []
            };
        }
        
        // Ensure presets is an array
        settings.presets = Array.isArray(settings.presets) ? settings.presets : [];
        return settings;
    } catch (error) {
        console.error('Error retrieving settings from chrome.storage.sync:', error);
        return {
            home: 'Wong Tai Sin',
            work: 'HKCEC',
            job: 'T9',
            projects: [{ name: 'VRMS', checked: true }, { name: 'RTPCS', checked: false }],
            presets: []
        };
    }
}

console.log('Custom script running!');

(function() {
    // Default settings in case storage retrieval is delayed
    let config = {
        home: 'Wong Tai Sin',
        work: 'HKCEC',
        job: 'T9',
        projects: [{ name: 'VRMS', checked: true }, { name: 'RTPCS', checked: false }],
        presets: []
    };

    // Load settings asynchronously
    retrieveSettingsFromChromeStorage().then(settings => {
        config = settings;
        console.log('Settings loaded:', config);
        // Update project radio buttons if already rendered
        if (window.location.pathname.startsWith('/hkots/create_claim_record.jsp')) {
            updateProjectRadios(config.projects);
        }
    }).catch(error => {
        console.error('Failed to load settings:', error);
    });

    function updateProjectRadios(projects) {
        const projectContainer = document.querySelector('#project-container');
        if (!projectContainer) {
            console.warn('Project container not found for update');
            return;
        }
        projectContainer.innerHTML = '';
        projects.forEach((project) => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `project-${project.name}`;
            radio.name = 'project';
            radio.value = project.name;
            radio.checked = project.checked;

            const label = document.createElement('label');
            label.htmlFor = radio.id;
            label.innerText = project.name;
            label.style.marginRight = '10px';

            projectContainer.appendChild(radio);
            projectContainer.appendChild(label);
        });
        console.log('Updated project radio buttons:', projects);
    }

    // Handle create_claim_record.jsp
    if (window.location.pathname.startsWith('/hkots/create_claim_record.jsp')) {
        console.log('Detected create_claim_record.jsp, initializing UI');
        // Create container for form elements
        const container = document.createElement('div');
        container.style.padding = '10px';
        container.style.backgroundColor = '#f0f0f0';
        container.style.border = '1px solid #ccc';
        container.style.margin = '10px';
        container.style.display = 'inline-block';

        // Date picker
        const dateLabel = document.createElement('label');
        dateLabel.innerText = 'Date: ';
        dateLabel.htmlFor = 'claim-date';
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.id = 'claim-date';
        dateInput.style.marginRight = '10px';

        // Travel fee input
        const travelLabel = document.createElement('label');
        travelLabel.innerText = 'Travel Fee: $';
        travelLabel.htmlFor = 'travel-fee';
        const travelInput = document.createElement('input');
        travelInput.type = 'number';
        travelInput.id = 'travel-fee';
        travelInput.value = '15.8';
        travelInput.step = '0.01';
        travelInput.min = '0';
        travelInput.style.marginRight = '10px';

        // Lunch fee input
        const lunchLabel = document.createElement('label');
        lunchLabel.innerText = 'Lunch Fee: $';
        lunchLabel.htmlFor = 'lunch-fee';
        const lunchInput = document.createElement('input');
        lunchInput.type = 'number';
        lunchInput.id = 'lunch-fee';
        lunchInput.value = '200';
        lunchInput.step = '0.01';
        lunchInput.min = '0';
        lunchInput.style.marginRight = '10px';

        // Project radio buttons
        const projectLabel = document.createElement('label');
        projectLabel.innerText = 'Project: ';
        projectLabel.style.marginRight = '10px';
        projectLabel.style.display = 'inline-block';

        const projectContainer = document.createElement('div');
        projectContainer.id = 'project-container';
        projectContainer.style.display = 'inline-block';

        config.projects.forEach((project) => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `project-${project.name}`;
            radio.name = 'project';
            radio.value = project.name;
            radio.checked = project.checked;

            const label = document.createElement('label');
            label.htmlFor = radio.id;
            label.innerText = project.name;
            label.style.marginRight = '10px';

            projectContainer.appendChild(radio);
            projectContainer.appendChild(label);
        });

        // Buttons
        const amTravelButton = document.createElement('button');
        amTravelButton.innerText = 'Claim AM Travel';
        amTravelButton.style.marginRight = '5px';

        const pmTravelButton = document.createElement('button');
        pmTravelButton.innerText = 'Claim PM Travel';
        pmTravelButton.style.marginRight = '5px';

        const officeTravelButton = document.createElement('button');
        officeTravelButton.innerText = 'Claim Office Travel';
        officeTravelButton.style.marginRight = '5px';

        const lunchButton = document.createElement('button');
        lunchButton.innerText = 'Claim Lunch';

        // Append elements to container
        container.appendChild(dateLabel);
        container.appendChild(dateInput);
        container.appendChild(document.createElement('br'));
        container.appendChild(travelLabel);
        container.appendChild(travelInput);
        container.appendChild(document.createElement('br'));
        container.appendChild(projectLabel);
        container.appendChild(projectContainer);
        container.appendChild(document.createElement('br'));
        container.appendChild(amTravelButton);
        container.appendChild(pmTravelButton);
        container.appendChild(officeTravelButton);
        container.appendChild(document.createElement('br'));
        container.appendChild(lunchLabel);
        container.appendChild(lunchInput);
        container.appendChild(lunchButton);

        // Add container to page
        document.body.appendChild(container);
        console.log('Custom UI container added to create_claim_record.jsp');

        // Button event listeners
        amTravelButton.addEventListener('click', () => {
            const date = dateInput.value;
            const travelFee = travelInput.value;
            const project = document.querySelector(
                'input[name="project"]:checked'
            ).value;
            if (date && travelFee) {
                window.updateClaimForm(date, 'am-travel', travelFee, project, config);
                console.log('AM Travel claim submitted:', { date, travelFee, project });
            } else {
                alert('Please enter a date and travel fee.');
                console.warn('AM Travel claim failed: Missing date or travel fee');
            }
        });

        pmTravelButton.addEventListener('click', () => {
            const date = dateInput.value;
            const travelFee = travelInput.value;
            const project = document.querySelector(
                'input[name="project"]:checked'
            ).value;
            if (date && travelFee) {
                window.updateClaimForm(date, 'pm-travel', travelFee, project, config);
                console.log('PM Travel claim submitted:', { date, travelFee, project });
            } else {
                alert('Please enter a date and travel fee.');
                console.warn('PM Travel claim failed: Missing date or travel fee');
            }
        });

        officeTravelButton.addEventListener('click', () => {
            const date = dateInput.value;
            const travelFee = travelInput.value;
            const project = document.querySelector(
                'input[name="project"]:checked'
            ).value;
            if (date && travelFee) {
                window.updateClaimForm(
                    date,
                    'office-travel',
                    travelFee,
                    project,
                    config
                );
                console.log('Office Travel claim submitted:', { date, travelFee, project });
            } else {
                alert('Please enter a date and travel fee.');
                console.warn('Office Travel claim failed: Missing date or travel fee');
            }
        });

        lunchButton.addEventListener('click', () => {
            const date = dateInput.value;
            const lunchFee = lunchInput.value;
            const project = document.querySelector(
                'input[name="project"]:checked'
            ).value;
            if (date && lunchFee) {
                window.updateClaimForm(date, 'lunch', lunchFee, project, config);
                console.log('Lunch claim submitted:', { date, lunchFee, project });
            } else {
                alert('Please enter a date and lunch fee.');
                console.warn('Lunch claim failed: Missing date or lunch fee');
            }
        });
    }

    // Handle ots002_log_user.jsp
    if (window.location.pathname.startsWith('/hkots/ots002_log_user.jsp')) {
        console.log('Detected ots002_log_user.jsp, initializing UI');
        console.log('Config.presets on load:', config.presets);

        // Add time pickers for START_TIME and END_TIME
        const startTimeField = document.querySelector('input[name="START_TIME"]');
        const endTimeField = document.querySelector('input[name="END_TIME"]');

        if (startTimeField) {
            startTimeField.insertAdjacentHTML(
                'afterend',
                '<input type="datetime-local" class="txtFieldLarge newTimePicker" style="display:inline;margin-left:10px;" data-target="START_TIME">'
            );
            console.log('Added datetime picker for START_TIME');
        } else {
            console.warn('START_TIME input field not found');
        }

        if (endTimeField) {
            endTimeField.insertAdjacentHTML(
                'afterend',
                '<input type="datetime-local" class="txtFieldLarge newTimePicker" style="display:inline;margin-left:10px;" data-target="END_TIME">'
            );
            console.log('Added datetime picker for END_TIME');
        } else {
            console.warn('END_TIME input field not found');
        }

        // Add event listeners to time pickers
        document.querySelectorAll('.newTimePicker').forEach((picker) => {
            picker.addEventListener('change', (e) => {
                const targetFieldName = e.target.dataset.target;
                const targetField = document.querySelector(
                    `input[name="${targetFieldName}"]`
                );

                if (e.target.value) {
                    // Convert to MM/dd/yyyy HH:mm format
                    const date = new Date(e.target.value);
                    const formattedDate =
                        `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
                        `${date.getDate().toString().padStart(2, '0')}/` +
                        `${date.getFullYear()} ` +
                        `${date.getHours().toString().padStart(2, '0')}:` +
                        `${date.getMinutes().toString().padStart(2, '0')}`;
                    targetField.value = formattedDate;
                    console.log(`Updated ${targetFieldName} to: ${formattedDate}`);
                } else {
                    targetField.value = '';
                    console.log(`Cleared ${targetFieldName}`);
                }
            });
        });

        // Create container for preset buttons
        const container = document.createElement('div');
        container.style.padding = '10px';
        container.style.backgroundColor = '#f0f0f0';
        container.style.border = '1px solid #ccc';
        container.style.margin = '10px';
        container.style.display = 'block';

        // Add preset buttons
        if (Array.isArray(config.presets) && config.presets.length > 0) {
            config.presets.forEach((preset, index) => {
                console.log('Creating button for preset:', preset);
                const button = document.createElement('button');
                button.innerText = `${preset.project} ${preset.location} ${preset.purpose}`;
                button.style.marginRight = '5px';
                button.style.marginBottom = '5px';
                button.style.display = 'inline-block';

                button.addEventListener('click', () => {
                    setLocationFrom(preset.location);
                    setProjId(preset.project);
                    setJobId(preset.purpose);
                    console.log('Preset applied:', preset);
                });

                container.appendChild(button);
            });
        } else {
            console.log('No presets found in config');
        }

        // Add container to page
        const formTable = document.querySelector('table[width="550"]');
        if (formTable) {
            formTable.parentElement.insertBefore(container, formTable);
            console.log('Container inserted before form table');
        } else {
            document.body.appendChild(container);
            console.log('Container appended to body');
        }
    }

    // Handle print_claim_record.jsp
    if (window.location.pathname.startsWith('/hkots/print_claim_record.jsp')) {
        console.log('Detected print_claim_record.jsp, initializing date fields');
        // Add new date fields inline with existing ones
        const dateFromField = document.querySelector('input[name="DATE_FROM"]');
        if (dateFromField) {
            dateFromField.insertAdjacentHTML(
                'afterend',
                '<input type="date" class="txtFieldLarge newDateField" style="display:inline;margin-left:10px;" data-target="DATE_FROM">'
            );
            console.log('Added date picker for DATE_FROM');
        } else {
            console.warn('DATE_FROM input field not found');
        }

        const dateToField = document.querySelector('input[name="DATE_TO"]');
        if (dateToField) {
            dateToField.insertAdjacentHTML(
                'afterend',
                '<input type="date" class="txtFieldLarge newDateField" style="display:inline;margin-left:10px;" data-target="DATE_TO">'
            );
            console.log('Added date picker for DATE_TO');
        } else {
            console.warn('DATE_TO input field not found');
        }

        // Add event listeners to new date fields
        document.querySelectorAll('.newDateField').forEach((field) => {
            field.addEventListener('change', (e) => {
                const targetFieldName = e.target.dataset.target;
                const targetField = document.querySelector(
                    `input[name="${targetFieldName}"]`
                );

                if (e.target.value) {
                    // Convert date to MM/dd/yyyy format
                    const date = new Date(e.target.value);
                    const formattedDate =
                        `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
                        `${date.getDate().toString().padStart(2, '0')}/` +
                        `${date.getFullYear()}`;
                    targetField.value = formattedDate;
                    console.log(`Updated ${targetFieldName} to: ${formattedDate}`);
                } else {
                    targetField.value = '';
                    console.log(`Cleared ${targetFieldName}`);
                }
            });
        });
    }
})();