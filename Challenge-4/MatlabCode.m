% Read temperature, humidity and pressure data from a ThingSpeak channel
% and visualize the data in a single plot using the MATLAB THINGSPEAKPLOT
% function.
points = 200;
% Channel ID to read data from
readChannelID = 172416;
% Temperature Field ID
FieldID1 = 1;
FieldID2 = 2;
FieldID3 = 3;
FieldID4 = 4;

% Channel Read API Key 
% If your channel is private, then enter the read API
% Key between the ' below: 
readAPIKey = 'VUAAI9TXKL2SHGVO';

% Read Temperature Data. Learn more about the THINGSPEAKREAD function by
% going to the Documentation tab on the right side pane of this page.
[temperature1, time] = thingSpeakRead(readChannelID, 'Fields', FieldID1, 'NumPoints', points, 'ReadKey', readAPIKey);

temperature2 = thingSpeakRead(readChannelID, 'Fields', FieldID2, 'NumPoints', points, 'ReadKey', readAPIKey);

temperature3 = thingSpeakRead(readChannelID, 'Fields', FieldID3, 'NumPoints', points, 'ReadKey', readAPIKey);

temperature4 = thingSpeakRead(readChannelID, 'Fields', FieldID4, 'Numpoints', points, 'ReadKey', readAPIKey);

% Learn more about the THINGSPEAKPLOT function by going to the Documentation tab on
% the right side pane of this page.
thingSpeakPlot(time, [temperature1, temperature2, temperature3, temperature4], 'legend',...
    {'Temperature 1', 'Temperature 2', 'Temperature 3', 'Temperature 4'},'Grid','on');"