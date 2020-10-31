// Target directory
if(process.argv.length < 3)
{
    console.log(`target directory is not defined.`);
    exit(-1);
}

const targetDir = process.argv[2];

// delete simlation
const isSimulate = false;

//
// ******
// 

// regex - target file
const targetFileRegex = /(.*)[\-_](?:gigapixel|output)\.(jpe?g|png)$/i;

// modules
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { exit } = require('process');


let processCount = 0;
let prevProcessCount = 0;

// convert unit
const byteToKbyte = (size) =>
{
    return Math.floor(size * 10 / 1024) / 10;
}

// Ddirectory scanning
const searchTargetFileInDirectory = (dir) =>
{
    console.log('-- dir: ' + dir);
    fs.readdir(dir, function(err, files)
    {
        if (err) return;
        // console.log(`files = ${files.length}`);
        
        for(const file of files)
        {
            var abspath = path.resolve(path.join(dir, file));
            try
            {
                const stats = fs.statSync(abspath);
                if(stats.isDirectory())
                    searchTargetFileInDirectory(abspath);
                else
                if(stats.isFile(file, dir))
                    processingFile(file, dir);
            }
            catch(e)
            {
                console.error('=> ' + abspath);
                console.error('e: ' + e.message);
//				console.error(`${e.stack}`);
            }
        }
        
        if(prevProcessCount != processCount)
        {
            console.log(`Process files: ${processCount}`);
            prevProcessCount = processCount;
        }
    });
}

searchTargetFileInDirectory(targetDir);

// delete and renemae
const processingFile = (fileName, dirPath) =>
{
    // Check to see if the file is the target.
    let result = fileName.match(targetFileRegex);	
    if(!result)
        return;
    
    //　Pick up the original file.
    const orgBasePath = path.resolve(path.join(dirPath, result[1]));
    const exts = [result[2], 'png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
    let orgFileStat = null;
    for(ext of exts)
    {
        const orgPath = orgBasePath + '.' + ext;
        try
        {
            // remove orignal file
            orgFileStat = fs.statSync(orgPath);
            if(!isSimulate)
            {
                fs.unlinkSync(orgPath);
                deleteFileSize += orgFileStat.size;
            }
            console.log('removed: ' + orgPath);
        }
        catch
        {
        }
    }
    
    ++processCount;
    
    // output filename to original
    const destPath = orgBasePath + '.' + result[2];
    const extraPath = path.resolve(path.join(dirPath, fileName));
    if(!isSimulate)
        fs.renameSync(extraPath, destPath);
    console.log('- renamed: ' + fileName + ' -> ' + result[1] + '.' + result[2]);
}
